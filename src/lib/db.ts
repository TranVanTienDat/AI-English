import Dexie, { type EntityTable } from "dexie";

interface User {
  id: number;
  name: string;
  avatar?: string;
  createdAt: Date;
}

interface Attempt {
  id: number;
  userId: number;
  taskType: "task1" | "task2" | "task3" | "part5" | "part6" | "part7";
  questionId?: number; // Optional if custom topic
  userContent: string; // The text or image URL (for task 1 input? no task 1 is image prompt, user writes sentence)
  // For Task 1: userContent is the sentence.
  // For Task 2/3: userContent is the essay/email.

  questionContent?: string; // Snapshot of the question/image url

  aiFeedback?: any; // JSON object from Gemini
  score?: number;
  timestamp: Date;
}

interface Question {
  id: number;
  type: "task1" | "task2" | "task3";
  content: string; // Text prompt or Image URL
  description?: string; // For Task 1 image description if needed
  level?: "0-90" | "100-140" | "150-170" | "180-200"; // TOEIC score range
  keywords?: string[]; // For Task 1
}

const db = new Dexie("ToeicWritingDB") as Dexie & {
  users: EntityTable<User, "id">;
  attempts: EntityTable<Attempt, "id">;
  questions: EntityTable<Question, "id">;
};

db.version(1).stores({
  users: "++id, name",
  attempts: "++id, userId, taskType, timestamp",
  questions: "++id, type",
});

db.version(2).stores({
  users: "++id, name",
  attempts: "++id, userId, taskType, timestamp",
  questions: "++id, type, level",
});

export type { User, Attempt, Question };
export { db };
