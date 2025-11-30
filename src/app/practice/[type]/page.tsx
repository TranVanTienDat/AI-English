"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { db } from "@/lib/db";
import { evaluateWriting, EvaluationResult } from "@/lib/gemini";
import { SAMPLE_TASKS } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Need to add textarea
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import Image from "next/image";

export default function PracticePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = use(params);
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const geminiToken = useStore((state) => state.geminiToken);
  const geminiModel = useStore((state) => state.geminiModel);

  const [question, setQuestion] = useState<any>(null);
  const [userContent, setUserContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
      return;
    }

    // Load random question
    const taskType = type as keyof typeof SAMPLE_TASKS;
    if (SAMPLE_TASKS[taskType]) {
      const tasks = SAMPLE_TASKS[taskType];
      const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
      setQuestion(randomTask);
    } else {
      toast.error("Invalid task type");
      router.push("/dashboard");
    }
  }, [type, currentUser, router]);

  const handleSubmit = async () => {
    if (!userContent.trim()) {
      toast.error("Please write something before submitting.");
      return;
    }

    if (!geminiToken) {
      toast.error("API Key not found. Please configure it in Settings.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await evaluateWriting(
        geminiToken,
        type as "task1" | "task2" | "task3",
        {
          userContent,
          questionContent:
            question.content || question.subject || question.topic, // Handle different structures
          keywords: question.keywords,
        },
        geminiModel || "gemini-2.5-flash"
      );

      // Save to DB
      const attemptId = await db.attempts.add({
        userId: currentUser!.id,
        taskType: type as "task1" | "task2" | "task3",
        questionId: question.id,
        userContent,
        questionContent: JSON.stringify(question),
        aiFeedback: result,
        score: result.score,
        timestamp: new Date(),
      });

      toast.success("Grading complete!");
      router.push(`/result/${attemptId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to grade. Please check your API Key or try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!question)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold capitalize">
          {type.replace("task", "Task ")} Practice
        </h1>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Exit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Question Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {type === "task1" && (
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={question.image}
                    alt="Task 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
                  <p className="font-semibold">Keywords:</p>
                  <div className="flex gap-2 mt-2">
                    {question.keywords.map((k: string) => (
                      <span
                        key={k}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {type === "task2" && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 mb-2">
                    From: {question.sender}
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Subject: {question.subject}
                  </p>
                  <div className="whitespace-pre-wrap font-serif text-slate-800 dark:text-slate-200">
                    {question.content}
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Directions: Respond to the email as if you are an employee at
                  the company.
                </p>
              </div>
            )}

            {type === "task3" && (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded border border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-lg mb-2">Topic:</h3>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {question.topic}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  Directions: Write an essay in response to the above topic.
                  Give reasons and examples to support your opinion.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Answer Section */}
        <Card className="flex flex-col h-full min-h-[500px]">
          <CardHeader>
            <CardTitle>Your Response</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <Textarea
              placeholder="Type your answer here..."
              className="flex-1 resize-none font-serif text-lg leading-relaxed p-4"
              value={userContent}
              onChange={(e) => setUserContent(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">
                Word count:{" "}
                {
                  userContent
                    .trim()
                    .split(/\s+/)
                    .filter((w) => w).length
                }
              </span>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !userContent.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Grading...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" /> Submit
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
