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
  overall_score?: number; // For Part 1 total score (0-50)
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
  // Part 1 specific
  keywords_used?: {
    keyword1: boolean;
    keyword2: boolean;
  };
  // Part 2 specific
  requests_answered?: {
    total_requests: number;
    answered: number;
    missing: string[];
  };
  format_check?: {
    has_greeting: boolean;
    has_closing: boolean;
    has_signature: boolean;
  };
  // Part 3 specific
  word_count?: number;
  structure_analysis?: {
    has_introduction: boolean;
    has_body_paragraphs: boolean;
    has_conclusion: boolean;
    has_examples: boolean;
  };
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
      prompt = TASK_1_PROMPT(
        data.userContent,
        data.keywords || [],
        data.questionContent // Pass scenario description for Part 1
      );
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
  modelName: string = "gemini-2.5-flash"
): Promise<GeneratedQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = GENERATE_QUESTION_PROMPT(level, topic);
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

    try {
      const json = JSON.parse(text);
      // Handle the new format: { questions: [...] }
      if (json.questions && Array.isArray(json.questions)) {
        return json.questions;
      }
      // Fallback for older format or unexpected structure (wrap in array)
      return [json];
    } catch (e) {
      console.error("Failed to parse JSON:", e);
      throw new Error("Invalid JSON response from AI");
    }
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
};
