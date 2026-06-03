import { ChatGoogle } from "@langchain/google";
import { ChatMistralAI } from "@langchain/mistralai";
import { Cohere } from "@langchain/cohere";
import config from "../config/config.js";


//Judge
export const geminiModel = new ChatGoogle({
    model: "gemini-flash-latest",
    apiKey: config.GOOGLE_API_KEY
});

export const mistralModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: config.MISTRAL_API_KEY
});

//vs

export const cohereModel = new Cohere({
    model: "command-a-03-2025",
    apiKey: config.COHERE_API_KEY
});