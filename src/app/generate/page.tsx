"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import {
  generateQuestion,
  evaluateWriting,
  GeneratedQuestion,
  EvaluationResult,
} from "@/lib/gemini";
import { db } from "@/lib/db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  Save,
  RefreshCw,
  Zap,
  Send,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function GeneratePage() {
  const router = useRouter();
  const geminiToken = useStore((state) => state.geminiToken);
  const geminiModel = useStore((state) => state.geminiModel);

  const [part, setPart] = useState<"part1" | "part2" | "part3">("part2");
  const [level, setLevel] = useState<
    "0-90" | "100-140" | "150-170" | "180-200"
  >("100-140");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] =
    useState<GeneratedQuestion | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Practice State
  const [userResponse, setUserResponse] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);

  const handleGenerate = async () => {
    if (!geminiToken) {
      setError("Please set your Gemini API Key in Settings first.");
      return;
    }
    setLoading(true);
    setError("");
    setGeneratedQuestion(null);
    setEvaluationResult(null);
    setUserResponse("");
    setSaved(false);

    try {
      const question = await generateQuestion(
        geminiToken,
        level,
        topic,
        part,
        geminiModel || "gemini-1.5-flash"
      );
      setGeneratedQuestion(question);
    } catch (err) {
      console.error(err);
      setError("Failed to generate question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!generatedQuestion || !userResponse.trim()) return;
    setIsEvaluating(true);
    try {
      const result = await evaluateWriting(
        geminiToken!,
        generatedQuestion.type,
        {
          userContent: userResponse,
          questionContent: generatedQuestion.content,
        },
        geminiModel || "gemini-1.5-flash"
      );
      setEvaluationResult(result);
    } catch (err) {
      console.error(err);
      setError("Failed to evaluate response. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedQuestion) return;
    try {
      await db.questions.add({
        type: generatedQuestion.type,
        content: generatedQuestion.content,
        description: generatedQuestion.description,
        level: generatedQuestion.level,
      });
      setSaved(true);
    } catch (err) {
      setError("Failed to save question to database.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Zap className="h-6 w-6 text-emerald-500" />
              Generate Writing Question
            </CardTitle>
            <CardDescription>
              AI creates a new writing prompt (email or essay topic) for you to
              practice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!geminiToken && (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm">
                Warning: No API Key found. Please configure it in Settings.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>TOEIC Part</Label>
                <select
                  value={part}
                  onChange={(e) =>
                    setPart(e.target.value as "part1" | "part2" | "part3")
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                >
                  <option value="part1">Part 1: Picture Sentence</option>
                  <option value="part2">Part 2: Email Response</option>
                  <option value="part3">Part 3: Opinion Essay</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Target Score Range</Label>
                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(
                      e.target.value as
                        | "0-90"
                        | "100-140"
                        | "150-170"
                        | "180-200"
                    )
                  }
                  className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
                >
                  <option value="0-90">0-90 (Beginner)</option>
                  <option value="100-140">100-140 (Intermediate)</option>
                  <option value="150-170">150-170 (Advanced)</option>
                  <option value="180-200">180-200 (Expert)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Topic / Context (Optional)</Label>
                <Input
                  placeholder="e.g., Business Meeting, Environment..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {generatedQuestion && (
              <div className="space-y-6">
                <div className="mt-6 border rounded-lg p-4 bg-slate-50 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg text-slate-800">
                      Generated Writing Prompt
                    </h3>
                    <Button
                      onClick={handleSave}
                      disabled={saved}
                      variant="ghost"
                      size="sm"
                      className="text-slate-500"
                    >
                      {saved ? (
                        <span className="flex items-center text-emerald-600">
                          <CheckCircle className="mr-1 h-4 w-4" /> Saved
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Save className="mr-1 h-4 w-4" /> Save to Library
                        </span>
                      )}
                    </Button>
                  </div>

                  {generatedQuestion.type === "task1" && (
                    <div className="space-y-3 bg-white p-4 rounded border">
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-2">
                          Scenario:
                        </p>
                        <p className="text-slate-800">
                          {generatedQuestion.content}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 mb-2">
                          Keywords to use:
                        </p>
                        <div className="flex gap-2">
                          {generatedQuestion.keywords?.map((kw, idx) => (
                            <span
                              key={idx}
                              className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {generatedQuestion.type === "task2" && (
                    <div className="whitespace-pre-wrap text-sm text-slate-700 bg-white p-4 rounded border">
                      {generatedQuestion.content}
                    </div>
                  )}

                  {generatedQuestion.type === "task3" && (
                    <div className="text-slate-800 font-medium p-4 bg-white rounded border">
                      {generatedQuestion.content}
                    </div>
                  )}
                </div>

                {/* Writing Area */}
                <div className="space-y-4">
                  <Label>Your Answer</Label>
                  <Textarea
                    placeholder="Type your response here..."
                    className="min-h-[200px] font-serif text-lg p-4"
                    value={userResponse}
                    onChange={(e) => setUserResponse(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleEvaluate}
                      disabled={isEvaluating || !userResponse.trim()}
                      className="w-full md:w-auto"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" /> Submit Answer
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Evaluation Results */}
                {evaluationResult && (
                  <div className="space-y-6 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-800">
                        Evaluation Result
                      </h3>
                      <div className="text-2xl font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg">
                        Score: {evaluationResult.score}/
                        {generatedQuestion.type === "task1"
                          ? "3"
                          : generatedQuestion.type === "task2"
                          ? "4"
                          : "5"}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Feedback</h4>
                      <p className="text-slate-700">
                        {evaluationResult.feedback}
                      </p>
                    </div>

                    {evaluationResult.errors &&
                      evaluationResult.errors.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-red-600">
                            Areas for Improvement
                          </h4>
                          {evaluationResult.errors.map((err, idx) => (
                            <div
                              key={idx}
                              className="bg-red-50 p-3 rounded border border-red-100 text-sm"
                            >
                              <p className="font-medium text-red-800">
                                {err.text}
                              </p>
                              <p className="text-red-600 mt-1">
                                <span className="font-semibold">
                                  Correction:
                                </span>{" "}
                                {err.correction}
                              </p>
                              <p className="text-slate-600 mt-1">
                                {err.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                    {(evaluationResult.sample_response ||
                      evaluationResult.sample_essay) && (
                      <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                        <h4 className="font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                          <Zap className="h-5 w-5" /> AI Perfect Answer
                        </h4>
                        <div className="whitespace-pre-wrap text-slate-800 font-serif leading-relaxed">
                          {evaluationResult.sample_response ||
                            evaluationResult.sample_essay}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter>
            {!generatedQuestion && (
              <Button
                onClick={handleGenerate}
                disabled={loading || !geminiToken}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" /> Generate Question
                  </>
                )}
              </Button>
            )}
            {generatedQuestion && (
              <Button
                onClick={handleGenerate}
                disabled={loading || !geminiToken}
                variant="outline"
                className="w-full mt-4"
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Generate New Question
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
