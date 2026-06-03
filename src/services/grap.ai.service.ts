import { StateSchema, MessagesValue, StateGraph, START, END } from "@langchain/langgraph";

type JUDGEMENT = {
    winner : "solution_1" | "solution_2";
    solution_1_score : number;
    solution_2_score : number;
}

type AiBattleState = {
    messages : typeof MessagesValue;
    solution_1 : string;
    solution_2 : string;
    judgement : JUDGEMENT;
}

//data between node will transfer using state
const state : AiBattleState = {
    messages : MessagesValue,
    solution_1 : "",
    solution_2 : "",
    judgement : {
        winner : "solution_1",
        solution_1_score : 0,
        solution_2_score : 0
    }
}
