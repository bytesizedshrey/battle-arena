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
   * Main function
   */
  export default async function solveProblem(
    problem: string
  ) {
    const result = await graph.invoke({
      problem
    });
  
    return result;
  }