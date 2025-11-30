import { Attempt } from "./db";
import { EvaluationResult } from "./gemini";

export interface ReducedAttempt {
  date: string;
  type: string;
  score: number;
  errors?: string[];
}

import { ReadingEvaluationResult } from "./gemini";

export function processAttemptsForAI(attempts: Attempt[]): ReducedAttempt[] {
  // Sort by date descending
  const sorted = [...attempts].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Take last 20 attempts to avoid token limits
  const recent = sorted.slice(0, 20);

  return recent.map((attempt) => {
    let errorTypes: string[] = [];

    if (["task1", "task2", "task3"].includes(attempt.taskType)) {
      // Writing
      const feedback = attempt.aiFeedback as EvaluationResult | undefined;
      errorTypes = feedback?.errors?.map((e) => e.type) || [];
    } else {
      // Reading
      const feedback = attempt.aiFeedback as
        | ReadingEvaluationResult
        | undefined;
      if (feedback) {
        if (attempt.taskType === "part5" && feedback.questionResults) {
          errorTypes = feedback.questionResults
            .filter((q) => !q.isCorrect && q.grammarPoint)
            .map((q) => q.grammarPoint!);
        } else if (
          ["part6", "part7"].includes(attempt.taskType) &&
          feedback.passageResults
        ) {
          feedback.passageResults.forEach((passage) => {
            passage.questionResults.forEach((q) => {
              if (!q.isCorrect) {
                if (q.questionType) {
                  errorTypes.push(q.questionType); // Part 7
                } else {
                  errorTypes.push("Context/Vocabulary"); // Part 6 fallback
                }
              }
            });
          });
        }
      }
    }

    // Deduplicate error types for this attempt
    const uniqueErrors = Array.from(new Set(errorTypes));

    return {
      date: new Date(attempt.timestamp).toISOString().split("T")[0], // YYYY-MM-DD
      type: attempt.taskType,
      score: attempt.score || 0,
      errors: uniqueErrors.length > 0 ? uniqueErrors : undefined,
    };
  });
}
