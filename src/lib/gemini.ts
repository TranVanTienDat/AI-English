import { GoogleGenAI } from "@google/genai";
import {
  SYSTEM_PROMPT,
  TASK_1_PROMPT,
  TASK_2_PROMPT,
  TASK_3_PROMPT,
  GENERATE_QUESTION_PROMPT,
} from "./prompts";

export interface EvaluationResult {
  score: number;
  feedback: string;
  errors: Array<{
    text: string;
    type: string;
    correction: string;
    explanation: string;
  }>;
  better_version?: string;
  sample_response?: string;
  sample_essay?: string;
  score_breakdown?: any;
}

export interface GeneratedQuestion {
  type: "task1" | "task2" | "task3";
  content: string;
  keywords?: string[];
  description?: string;
  level: "0-90" | "100-140" | "150-170" | "180-200";
}

export const evaluateWriting = async (
  apiKey: string,
  taskType: "task1" | "task2" | "task3",
  data: {
    userContent: string;
    questionContent?: string; // For Task 2 (email) or Task 3 (topic)
    keywords?: string[]; // For Task 1
    imageParts?: string[]; // For Task 1 (base64) - Not fully implemented in prompt yet, but prepared
  },
  modelName: string = "gemini-2.5-flash"
): Promise<EvaluationResult> => {
  const ai = new GoogleGenAI({ apiKey });

  let prompt = "";

  switch (taskType) {
    case "task1":
      prompt = TASK_1_PROMPT(data.userContent, data.keywords || []);
      break;
    case "task2":
      prompt = TASK_2_PROMPT(data.questionContent || "", data.userContent);
      break;
    case "task3":
      prompt = TASK_3_PROMPT(data.questionContent || "", data.userContent);
      break;
  }

  const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as EvaluationResult;
  } catch (error) {
    console.error("Gemini Evaluation Error:", error);
    throw new Error(
      "Failed to evaluate writing. Please check your API Key and try again."
    );
  }
};

// New function to generate a question based on level and optional topic
export const generateQuestion = async (
  apiKey: string,
  level: "0-90" | "100-140" | "150-170" | "180-200",
  topic?: string,
  part?: "part1" | "part2" | "part3",
  modelName: string = "gemini-2.5-flash"
): Promise<GeneratedQuestion> => {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = GENERATE_QUESTION_PROMPT(level, topic, part);
  const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as GeneratedQuestion;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate question. Please check your API Key.");
  }
};
