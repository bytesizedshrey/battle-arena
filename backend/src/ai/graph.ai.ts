import {
    StateGraph,
    StateSchema,
    START,
    END,
    type GraphNode
  } from "@langchain/langgraph";
  
  import { z } from "zod";
  import {
    cohereModel,
    geminiModel,
    mistralAiModel
  } from "./model.ai.js";
  
  import {
    createAgent,
    HumanMessage,
    providerStrategy
  } from "langchain";

  import config from "../config/config.js";
  
  /**
   * Shared graph state
   */
  const state = new StateSchema({
    problem: z.string().default(""),
  
    // AI responses
    solution_1: z.string().default(""),
    solution_2: z.string().default(""),
  
    // Judge result
    judge: z
      .object({
        solution_1_score: z.number().default(0),
        solution_2_score: z.number().default(0),
        solution_1_reasoning: z.string().default(""),
        solution_2_reasoning: z.string().default("")
      })
      .default({
        solution_1_score: 0,
        solution_2_score: 0,
        solution_1_reasoning: "",
        solution_2_reasoning: ""
      })
  });
  
  /**
   * Solution Node
   * Runs Mistral + Cohere in parallel
   */
  const solutionNode: GraphNode<typeof state> = async (
    currentState
  ) => {
    const [mistralResponse, cohereResponse] =
      await Promise.all([
        mistralAiModel.invoke(currentState.problem),
        cohereModel.invoke(currentState.problem)
      ]);
  
    return {
      solution_1: String(mistralResponse.content),
      solution_2: String(cohereResponse.content)
    };
  };
  
  /**
   * Judge Node
   * Gemini compares both responses
   */
  const judgeNode: GraphNode<typeof state> = async (
    currentState
  ) => {
    const {
      problem,
      solution_1,
      solution_2
    } = currentState;
  
    const judge = createAgent({
      model: geminiModel,
  
      responseFormat: providerStrategy(
        z.object({
          solution_1_score: z.number().min(0).max(10),
          solution_2_score: z.number().min(0).max(10),
          solution_1_reasoning: z.string(),
          solution_2_reasoning: z.string()
        })
      ),
  
      systemPrompt: `
  You are an AI judge.
  
  Compare responses from different AI models and rate them from 1 to 10 based on:
  
  - Accuracy
  - Logic
  - Clarity
  - Overall quality
  
  Give short Gen Z style reasoning for each score.
  Explain who cooked and who fumbled 💀
  But stay fair and unbiased.
  `
    });
  
    const judgeResponse = await judge.invoke({
      messages: [
        new HumanMessage(`
  Problem:
  ${problem}
  
  Solution 1:
  ${solution_1}
  
  Solution 2:
  ${solution_2}
  
  Evaluate both solutions and provide scores with reasoning.
  `)
      ]
    });
  
    const structured =
      judgeResponse.structuredResponse;
  
    return {
      judge: {
        solution_1_score:
          structured.solution_1_score,
  
        solution_2_score:
          structured.solution_2_score,
  
        solution_1_reasoning:
          structured.solution_1_reasoning,
  
        solution_2_reasoning:
          structured.solution_2_reasoning
      }
    };
  };
  
  /**
   * Graph Flow
   *
   * START
   *   ↓
   * solutionNode
   *   ├── Mistral generates solution_1
   *   └── Cohere generates solution_2
   *   ↓
   * judgeNode (Gemini Judge)
   *   ├── Compares responses
   *   ├── Gives scores (0-10)
   *   └── Gives reasoning 💀
   *   ↓
   * END
   */
  const graph = new StateGraph(state)
    .addNode("solution", solutionNode)
    .addNode("judge_node", judgeNode)
    .addEdge(START, "solution")
    .addEdge("solution", "judge_node")
    .addEdge("judge_node", END)
    .compile();

  /**
   * Gemini Simulation mode if Mistral or Cohere keys are missing
   */
  async function simulateWithGemini(problem: string) {
    const simulator = createAgent({
      model: geminiModel,
      responseFormat: providerStrategy(
        z.object({
          solution_1: z.string().describe("Solution for the problem from a Mistral model perspective"),
          solution_2: z.string().describe("Solution for the problem from a Cohere model perspective"),
          solution_1_score: z.number().min(0).max(10),
          solution_2_score: z.number().min(0).max(10),
          solution_1_reasoning: z.string().describe("Gen Z style evaluation of solution 1"),
          solution_2_reasoning: z.string().describe("Gen Z style evaluation of solution 2")
        })
      ),
      systemPrompt: `
      You are simulating an AI Battle Arena.
      You need to generate two distinct, high-quality, helpful solutions to the user's problem.
      - Solution 1: Write it from the perspective of a Mistral model (highly structured, concise, technical).
      - Solution 2: Write it from the perspective of a Cohere model (explanatory, rich in context, using examples).

      After generating both, act as a neutral AI judge. Rate both solutions from 1 to 10.
      Provide short Gen Z style reasoning for each score, explaining who cooked and who fumbled 💀.
      `
    });

    const response = await simulator.invoke({
      messages: [new HumanMessage(`Problem: ${problem}`)]
    });

    const structured = response.structuredResponse;
    return {
      problem,
      solution_1: structured.solution_1,
      solution_2: structured.solution_2,
      judge: {
        solution_1_score: structured.solution_1_score,
        solution_2_score: structured.solution_2_score,
        solution_1_reasoning: structured.solution_1_reasoning + " (Simulated by Gemini)",
        solution_2_reasoning: structured.solution_2_reasoning + " (Simulated by Gemini)"
      }
    };
  }

  /**
   * Offline Mock Mode if all API keys are missing
   */
  function generateMockResponse(problem: string) {
    const score1 = 7.5 + Math.random() * 2.0;
    const score2 = 7.0 + Math.random() * 2.5;
    return {
      problem,
      solution_1: `**[OFFLINE SIMULATION - MISTRAL]**\nHere is a comprehensive solution for: "${problem}"\n\n1. **Core Concept**: To address this problem, we must analyze the key constraints and dependencies.\n2. **Strategy**: A robust implementation requires splitting the processing into modular, isolated steps.\n3. **Recommendation**: We recommend setting up automated validation tests to check for consistency.\n\n*Note: Running in Offline Mode because MISTRAL_API_KEY is not configured.*`,
      solution_2: `**[OFFLINE SIMULATION - COHERE]**\nAlternative perspective on: "${problem}"\n\n- **Analysis**: The problem presents interesting trade-offs in performance and flexibility.\n- **Approach**: By leveraging modern design systems and solid caching strategies, we can mitigate latency.\n- **Next Steps**: Set up metric monitors to check runtime execution statistics.\n\n*Note: Running in Offline Mode because COHERE_API_KEY is not configured.*`,
      judge: {
        solution_1_score: parseFloat(score1.toFixed(1)),
        solution_2_score: parseFloat(score2.toFixed(1)),
        solution_1_reasoning: `Offline Mode activated. Mistral response was simulated locally. The structure looks decent but it is a mockup, no real model cooked here. 🤖`,
        solution_2_reasoning: `Cohere response was also simulated offline. Nice effort with the bullet points, but again, this is just a mockup. 💀`
      }
    };
  }
  
  /**
   * Main function
   */
  export default async function solveProblem(
    problem: string
  ) {
    const hasGoogle = !!config.GOOGLE_API_KEY;
    const hasMistral = !!config.MISTRAL_API_KEY;
    const hasCohere = !!config.COHERE_API_KEY;

    console.log(`[Battle Arena] API Keys: Google=${hasGoogle}, Mistral=${hasMistral}, Cohere=${hasCohere}`);

    try {
      if (hasGoogle && hasMistral && hasCohere) {
        const result = await graph.invoke({
          problem
        });
        return {
          problem,
          solution_1: result.solution_1,
          solution_2: result.solution_2,
          judge: result.judge
        };
      } else if (hasGoogle) {
        console.log("[Battle Arena] Running Gemini simulation fallback...");
        return await simulateWithGemini(problem);
      } else {
        console.log("[Battle Arena] Running offline mock simulation...");
        return generateMockResponse(problem);
      }
    } catch (error) {
      console.error("[Battle Arena] Error running LangGraph graph:", error);
      if (hasGoogle) {
        try {
          return await simulateWithGemini(problem);
        } catch (geminiError) {
          console.error("[Battle Arena] Gemini simulation fallback also failed:", geminiError);
          return generateMockResponse(problem);
        }
      } else {
        return generateMockResponse(problem);
      }
    }
  }