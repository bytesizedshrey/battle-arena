import { HumanMessage } from "@langchain/core/messages";
import {
  StateSchema,
  MessagesValue,
  StateGraph,
  START,
  END,
  type GraphNode,
  ReducedValue,
} from "@langchain/langgraph";
import { z } from "zod";
import { cohereModel, geminiModel, mistralModel } from "./models.service.js";
import { createAgent, providerStrategy } from "langchain";

const State = new StateSchema({
  messages: MessagesValue,
  solution_1: new ReducedValue(z.string().default(""), {
    reducer: (current, next) => {
      return next;
    },
  }),
  solution_2: new ReducedValue(z.string().default(""), {
    reducer: (current, next) => {
      return next;
    },
  }),
  judge_recommendation: new ReducedValue(
    z.object().default({
      solution_1_score: 0,
      solution_2_score: 0,
    }),
    {
      reducer: (currrent, next) => {
        return next;
      },
    },
  ),
});

const solutionNode: GraphNode<typeof State> = async (state: typeof State) => {
  console.log(state);
  const [mistral_solution, cohere_solution] = await Promise.all([
    mistralModel.invoke(state.messages[0].text),
    cohereModel.invoke(state.messages[0].text),
  ]);
  return {
    solution_1: mistral_solution.text,
    solution_2: cohere_solution.text,
  };
};

const judgeNode: GraphNode<typeof State> = async (state: typeof State) => {
    const { solution_1, solution_2 } = state;
  
    const judge = createAgent({
      model: geminiModel,
      tools: [],
      responseFormat: providerStrategy(
        z.object({
          solution_1_score: z.number().min(0).max(10),
          solution_2_score: z.number().min(0).max(10),
        })
      ),
    });
  
    const judgeResponse = await judge.invoke({
      messages: [
        new HumanMessage(`
          You are an expert AI judge.
  
          Your task is to compare two AI-generated responses and score them based on:
          - Accuracy
          - Helpfulness
          - Clarity
          - Completeness
          - Relevance to the user's question
  
          User Question:
          ${state.messages[0].text}
  
          Response 1:
          ${solution_1}
  
          Response 2:
          ${solution_2}
  
          Score both responses from 0 to 10.
  
          Return ONLY valid structured output.
        `),
      ],
    });
  
    const result = judgeResponse.structuredResponse;
  
    return {
      judge_recommendation: result,
    };
  };

const graph = new StateGraph(State)
  .addNode("solution", solutionNode)
  .addNode('judge',judgeNode)
  .addEdge(START, "solution")
  .addEdge("solution", "judge")
  .addEdge('judge',END)
  .compile();

export default async function (userMessage: string) {
  const result = await graph.invoke({
    messages: [new HumanMessage(userMessage)],
  });

  console.log(result);

  return result.messages;
}
