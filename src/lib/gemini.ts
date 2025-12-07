import { GoogleGenAI } from "@google/genai";
import {
  SYSTEM_PROMPT,
  TASK_1_PROMPT,
  TASK_2_PROMPT,
  TASK_3_PROMPT,
  GENERATE_QUESTION_PROMPT,
  ANALYZE_PROGRESS_PROMPT,
} from "./prompts";

export interface EvaluationResult {
  score: number;
  overall_score?: number; // For Part 1 total score (0-50)
  proficiencyLevel?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
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
  questions?: Array<{
    id: number;
    score: number;
    keywords_used: { keyword1: boolean; keyword2: boolean };
    errors: Array<{ text: string; correction: string; explanation: string }>;
    better_version: string;
    feedback: string;
  }>;
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
  topic?: string,
  modelName: string = "gemini-2.5-flash"
): Promise<GeneratedQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = GENERATE_QUESTION_PROMPT(topic);
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

// ============================================
// TOEIC READING TYPES & FUNCTIONS
// ============================================

import {
  READING_SYSTEM_PROMPT,
  READING_PART5_EVALUATION_PROMPT,
  READING_PART6_EVALUATION_PROMPT,
  READING_PART7_EVALUATION_PROMPT,
  GENERATE_READING_QUESTION_PROMPT,
} from "./prompts";

// Reading Question Types
export interface ReadingQuestion {
  id: number;
  sentence?: string; // For Part 5
  options: string[];
  correctAnswer: string;
  grammarPoint?: string; // For Part 5
  questionText?: string; // For Part 7
  questionType?:
    | "detail"
    | "inference"
    | "purpose"
    | "vocabulary"
    | "reference"; // For Part 7
  blankNumber?: number; // For Part 6
  type?: "word" | "sentence"; // For Part 6
}

export interface ReadingPassage {
  id: number;
  type: string; // "Email", "Notice", "Article", etc.
  text: string; // For Part 6
  texts?: string[]; // For Part 7 (multiple passages)
  passageType?: "single" | "double" | "triple"; // For Part 7
  questions: ReadingQuestion[];
}

export interface GeneratedReadingTest {
  part: 5 | 6 | 7;
  batchNumber?: number; // For batch generation
  questions?: ReadingQuestion[]; // For Part 5
  passage?: ReadingPassage; // For Part 6 (single passage - legacy)
  passages?: ReadingPassage[]; // For Part 6 (multiple) & Part 7
}

// Reading Evaluation Result Types
export interface ReadingQuestionResult {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  wrongOptions?: Array<{
    option: string;
    reason: string;
  }>;
  grammarPoint?: string; // Part 5
  tip?: string; // Part 5
  coherenceNote?: string; // Part 6
  evidence?: string; // Part 7
  questionText?: string; // Part 7
  questionType?: string; // Part 7
  blankNumber?: number; // Part 6
}

export interface ReadingPassageResult {
  passageId: number;
  passageType?: string;
  passageSummary?: string;
  questionResults: ReadingQuestionResult[];
}

export interface ReadingEvaluationResult {
  totalQuestions: number;
  correctAnswers: number;
  score: number; // Raw score
  scaledScore: number; // 5-495 TOEIC scale
  proficiencyLevel?: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  feedback: string;
  questionResults?: ReadingQuestionResult[]; // For Part 5
  passageResults?: ReadingPassageResult[]; // For Part 6 & 7
}

// Generate Reading Questions
export const generateReadingQuestion = async (
  apiKey: string,
  part: 5 | 6 | 7,
  topic?: string,
  modelName: string = "gemini-2.5-flash",
  batchNumber?: number
): Promise<GeneratedReadingTest> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = GENERATE_READING_QUESTION_PROMPT(part, topic, batchNumber);
  const fullPrompt = `${READING_SYSTEM_PROMPT}\n\n${prompt}`;

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

    const json = JSON.parse(text);
    return json as GeneratedReadingTest;
  } catch (error) {
    console.error("Error generating reading question:", error);
    throw new Error(
      "Failed to generate reading question. Please check your API Key and try again."
    );
  }
};

// Evaluate Reading Answers
export const evaluateReading = async (
  apiKey: string,
  part: 5 | 6 | 7,
  data: {
    // Part 5 data
    questions?: Array<{
      id: number;
      sentence: string;
      options: string[];
      correctAnswer: string;
      userAnswer: string;
    }>;
    // Part 6 data
    passages?: Array<{
      passageId: number;
      passageText: string;
      questions: Array<{
        id: number;
        blankNumber: number;
        options: string[];
        correctAnswer: string;
        userAnswer: string;
      }>;
    }>;
    // Part 7 data
    part7Passages?: Array<{
      passageId: number;
      passageType: "single" | "double" | "triple";
      passageTexts: string[];
      questions: Array<{
        id: number;
        questionText: string;
        questionType:
          | "detail"
          | "inference"
          | "purpose"
          | "vocabulary"
          | "reference";
        options: string[];
        correctAnswer: string;
        userAnswer: string;
      }>;
    }>;
  },
  modelName: string = "gemini-2.5-flash"
): Promise<ReadingEvaluationResult> => {
  const ai = new GoogleGenAI({ apiKey });

  let prompt = "";

  switch (part) {
    case 5:
      if (!data.questions) throw new Error("Part 5 requires questions data");
      prompt = READING_PART5_EVALUATION_PROMPT(data.questions);
      break;
    case 6:
      if (!data.passages) throw new Error("Part 6 requires passages data");
      prompt = READING_PART6_EVALUATION_PROMPT(data.passages);
      break;
    case 7:
      if (!data.part7Passages) throw new Error("Part 7 requires passages data");
      prompt = READING_PART7_EVALUATION_PROMPT(data.part7Passages);
      break;
  }

  const fullPrompt = `${READING_SYSTEM_PROMPT}\n\n${prompt}`;

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

    return JSON.parse(text) as ReadingEvaluationResult;
  } catch (error) {
    console.error("Gemini Reading Evaluation Error:", error);
    throw new Error(
      "Failed to evaluate reading. Please check your API Key and try again."
    );
  }
};

export interface ProgressAnalysis {
  trend: "improving" | "declining" | "stable" | "mixed";
  summary: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  strengths: string[];
  weaknesses: string[];
  advice: string;
}

export const analyzeProgress = async (
  apiKey: string,
  data: any[],
  modelName: string = "gemini-2.5-flash"
): Promise<ProgressAnalysis> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = ANALYZE_PROGRESS_PROMPT(JSON.stringify(data, null, 2));
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

    return JSON.parse(text) as ProgressAnalysis;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error(
      "Failed to analyze progress. Please check your API Key and try again."
    );
  }
};

// ============================================
// TRANSLATION PRACTICE FUNCTIONS
// ============================================

import {
  GENERATE_VIETNAMESE_PASSAGES_PROMPT,
  EVALUATE_TRANSLATION_PROMPT,
} from "./prompts";

export interface VietnamesePassage {
  id: number;
  vietnamese: string;
  topic: string;
  targetVocabulary: Array<{
    vietnamese: string;
    english: string;
    explanation: string;
  }>;
}

export interface TranslationEvaluation {
  score: number;
  feedback: string;
  accuracy: {
    score: number;
    comment: string;
  };
  grammar: {
    score: number;
    errors: Array<{
      text: string;
      correction: string;
      explanation: string;
    }>;
  };
  vocabulary: {
    score: number;
    issues: Array<{
      text: string;
      suggestion: string;
      explanation: string;
    }>;
    newWords: Array<{
      vietnamese: string;
      english: string;
      context: string;
    }>;
  };
  naturalness: {
    score: number;
    comment: string;
  };
  better_version: string;
  suggestions: string[];
}

export const generateVietnamesePassages = async (
  apiKey: string,
  proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert",
  passageLength: "20-30" | "40-50" | "60-80",
  count: number = 10,
  modelName: string = "gemini-2.5-flash"
): Promise<VietnamesePassage[]> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = GENERATE_VIETNAMESE_PASSAGES_PROMPT(
    proficiencyLevel,
    passageLength,
    count
  );

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const json = JSON.parse(text);
    return json.passages as VietnamesePassage[];
  } catch (error) {
    console.error("Error generating Vietnamese passages:", error);
    throw new Error(
      "Failed to generate passages. Please check your API Key and try again."
    );
  }
};

export const evaluateTranslation = async (
  apiKey: string,
  vietnamesePassage: string,
  userTranslation: string,
  proficiencyLevel: string,
  targetVocabulary?: Array<{ vietnamese: string; english: string }>,
  modelName: string = "gemini-2.5-flash"
): Promise<TranslationEvaluation> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = EVALUATE_TRANSLATION_PROMPT(
    vietnamesePassage,
    userTranslation,
    proficiencyLevel,
    targetVocabulary
  );

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as TranslationEvaluation;
  } catch (error) {
    console.error("Error evaluating translation:", error);
    throw new Error(
      "Failed to evaluate translation. Please check your API Key and try again."
    );
  }
};
