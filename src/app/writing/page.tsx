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
import { QuestionPrompt } from "@/components/QuestionPrompt";
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
  Loader2,
  RefreshCw,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Zap,
  Save,
  Check,
  PenTool,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function WritingPage() {
  const router = useRouter();
  const geminiToken = useStore((state) => state.geminiToken);
  const geminiModel = useStore((state) => state.geminiModel);

  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] =
    useState<GeneratedQuestion | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Practice State
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [evaluations, setEvaluations] = useState<
    Record<string, EvaluationResult>
  >({});
  const [evaluating, setEvaluating] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    if (!geminiToken) {
      setError("Please set your Gemini API Key in Settings first.");
      return;
    }
    setLoading(true);
    setError("");
    setQuestions([]);
    setEvaluations({});
    setResponses({});
    setSaved(false);

    try {
      const generatedQuestions = await generateQuestion(
        geminiToken,
        topic,
        geminiModel || "gemini-2.5-flash"
      );
      setQuestions(generatedQuestions);
    } catch (err) {
      console.error(err);
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (question: GeneratedQuestion) => {
    if (!geminiToken) {
      setError("Please set your Gemini API Key in Settings first.");
      return;
    }

    const response = responses[question.type] || "";
    if (!response.trim()) {
      toast.error("Please write an answer first");
      return;
    }

    setEvaluating((prev) => ({ ...prev, [question.type]: true }));
    setError("");

    try {
      const result = await evaluateWriting(
        geminiToken!,
        question.type,
        {
          userContent: response,
          questionContent: question.content,
          keywords: question.keywords, // For Part 1
        },
        geminiModel || "gemini-2.5-flash"
      );

      setEvaluations((prev) => ({ ...prev, [question.type]: result }));

      // Save to history (optional, maybe save all at once later?)
      // For now, let's just keep local state
    } catch (err) {
      console.error(err);
      setError("Failed to evaluate. Please try again.");
    } finally {
      setEvaluating((prev) => ({ ...prev, [question.type]: false }));
    }
  };

  const handleSave = async () => {
    if (!questions.length) return;

    try {
      // Save all evaluations that exist
      for (const question of questions) {
        const evaluation = evaluations[question.type];
        const response = responses[question.type];

        if (evaluation && response) {
          await db.attempts.add({
            userId: 1, // Default user for now
            timestamp: new Date(),
            taskType: question.type,
            questionContent: question.content,
            userContent: response,
            score: evaluation.score,
            aiFeedback: evaluation,
          });
        }
      }

      setSaved(true);
      toast.success("Results saved to Library");
    } catch (error) {
      console.error("Failed to save:", error);
      toast.error("Failed to save results");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 ">
      <div className="flex items-center justify-between fixed top-0 left-0 right-0 px-8 py-2 bg-background">
        <Link href="/dashboard">
          <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <Button
          onClick={handleSave}
          disabled={!questions.length || saved}
          className="ml-2"
        >
          {saved ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Saved
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Results
            </>
          )}
        </Button>
      </div>
      <div className="mx-auto mt-12">
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Zap className="h-6 w-6 text-warning" />
                Generate Writing Question
              </CardTitle>

              <div>
                {!questions.length ? (
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
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={loading || !geminiToken}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Generate New Test
                  </Button>
                )}
              </div>
            </div>
            <CardDescription>
              AI creates a new writing question (Part 1, 2, or 3) for you to
              practice.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!geminiToken && (
              <div className="bg-warning/10 text-warning-foreground p-4 rounded-lg text-sm">
                Warning: No API Key found. Please configure it in Settings.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="space-y-12">
                {questions.map((question, index) => {
                  const wordCount = (responses[question.type] || "")
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean).length;
                  const evaluationResult = evaluations[question.type];
                  const isEvaluating = evaluating[question.type];

                  return (
                    <div
                      key={index}
                      className="space-y-6 border-b border-slate-200 pb-12 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800">
                          Question {index + 1}:{" "}
                          {question.type === "task1"
                            ? "Picture Sentence"
                            : question.type === "task2"
                            ? "Email Response"
                            : "Opinion Essay"}
                        </h3>
                      </div>

                      <QuestionPrompt question={question} />

                      {/* Writing Area */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label>Your Answer</Label>
                          {question.type === "task3" && (
                            <span
                              className={`text-sm font-medium ${
                                wordCount < 120
                                  ? "text-red-600"
                                  : wordCount > 150
                                  ? "text-warning"
                                  : "text-success"
                              }`}
                            >
                              Word Count: {wordCount}
                            </span>
                          )}
                        </div>
                        <Textarea
                          placeholder={
                            question.type === "task1"
                              ? "1. Sentence for picture 1...\n2. Sentence for picture 2...\n3. ...\n4. ...\n5. ..."
                              : "Type your response here..."
                          }
                          className="min-h-[150px] font-serif text-lg p-4"
                          value={responses[question.type] || ""}
                          onChange={(e) =>
                            setResponses((prev) => ({
                              ...prev,
                              [question.type]: e.target.value,
                            }))
                          }
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleEvaluate(question)}
                            disabled={
                              isEvaluating || !responses[question.type]?.trim()
                            }
                            className="bg-slate-900 text-white hover:bg-slate-800"
                          >
                            {isEvaluating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Evaluating...
                              </>
                            ) : (
                              <>
                                <PenTool className="mr-2 h-4 w-4" />
                                Evaluate Answer
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Evaluation Result */}
                      {evaluationResult && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">
                              Evaluation Result
                            </h3>
                            <div className="text-2xl font-bold text-success bg-success/10 px-4 py-2 rounded-lg">
                              {question.type === "task1"
                                ? "Overall Score"
                                : "Score"}
                              :{" "}
                              {evaluationResult.overall_score ||
                                evaluationResult.score}
                              /
                              {question.type === "task1"
                                ? "50"
                                : question.type === "task2"
                                ? "50"
                                : "100"}
                            </div>
                            {evaluationResult.proficiencyLevel && (
                              <div className="text-xl font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                                Level: {evaluationResult.proficiencyLevel}
                              </div>
                            )}
                          </div>

                          <div className="bg-slate-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Feedback</h4>
                            <p className="text-slate-700">
                              {evaluationResult.feedback}
                            </p>
                          </div>

                          {/* Part 1: Keywords Check */}
                          {question.type === "task1" &&
                            evaluationResult.keywords_used && (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2 text-blue-800">
                                  Keywords Usage
                                </h4>
                                <div className="flex gap-3">
                                  {question.keywords?.map((kw, idx) => (
                                    <div
                                      key={idx}
                                      className={`px-3 py-1 rounded-full font-medium ${
                                        evaluationResult.keywords_used?.[
                                          `keyword${
                                            idx + 1
                                          }` as keyof typeof evaluationResult.keywords_used
                                        ]
                                          ? "bg-success/10 text-success"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {kw}:{" "}
                                      {evaluationResult.keywords_used?.[
                                        `keyword${
                                          idx + 1
                                        }` as keyof typeof evaluationResult.keywords_used
                                      ]
                                        ? "✓ Used"
                                        : "✗ Not used"}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Part 2: Email Format Check */}
                          {question.type === "task2" &&
                            evaluationResult.format_check && (
                              <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2 text-blue-800">
                                  Email Format Check
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    Greeting:{" "}
                                    {evaluationResult.format_check.has_greeting
                                      ? "✓"
                                      : "✗"}
                                  </p>
                                  <p>
                                    Closing:{" "}
                                    {evaluationResult.format_check.has_closing
                                      ? "✓"
                                      : "✗"}
                                  </p>
                                  <p>
                                    Signature:{" "}
                                    {evaluationResult.format_check.has_signature
                                      ? "✓"
                                      : "✗"}
                                  </p>
                                </div>
                                {evaluationResult.requests_answered && (
                                  <div className="mt-3 pt-3 border-t border-blue-200">
                                    <p className="font-medium">
                                      Requests Answered:{" "}
                                      {
                                        evaluationResult.requests_answered
                                          .answered
                                      }
                                      /
                                      {
                                        evaluationResult.requests_answered
                                          .total_requests
                                      }
                                    </p>
                                    {evaluationResult.requests_answered.missing
                                      .length > 0 && (
                                      <div className="mt-2">
                                        <p className="text-red-600 font-medium">
                                          Missing:
                                        </p>
                                        <ul className="list-disc list-inside">
                                          {evaluationResult.requests_answered.missing.map(
                                            (req, idx) => (
                                              <li
                                                key={idx}
                                                className="text-red-600"
                                              >
                                                {req}
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                          {/* Part 3: Word Count & Structure */}
                          {question.type === "task3" && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-semibold mb-2 text-blue-800">
                                Essay Analysis
                              </h4>
                              <div className="space-y-2 text-sm">
                                <p>
                                  Word Count:{" "}
                                  <span
                                    className={`font-medium ${
                                      (evaluationResult.word_count || 0) < 120
                                        ? "text-red-600"
                                        : (evaluationResult.word_count || 0) >
                                          150
                                        ? "text-warning"
                                        : "text-success"
                                    }`}
                                  >
                                    {evaluationResult.word_count || wordCount}{" "}
                                    words
                                  </span>
                                </p>
                                {evaluationResult.structure_analysis && (
                                  <div className="mt-2">
                                    <p className="font-medium">Structure:</p>
                                    <ul className="list-none space-y-1">
                                      <li>
                                        {evaluationResult.structure_analysis
                                          .has_introduction
                                          ? "✓"
                                          : "✗"}{" "}
                                        Introduction
                                      </li>
                                      <li>
                                        {evaluationResult.structure_analysis
                                          .has_body_paragraphs
                                          ? "✓"
                                          : "✗"}{" "}
                                        Body Paragraphs
                                      </li>
                                      <li>
                                        {evaluationResult.structure_analysis
                                          .has_conclusion
                                          ? "✓"
                                          : "✗"}{" "}
                                        Conclusion
                                      </li>
                                      <li>
                                        {evaluationResult.structure_analysis
                                          .has_examples
                                          ? "✓"
                                          : "✗"}{" "}
                                        Examples Provided
                                      </li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {evaluationResult.errors &&
                            evaluationResult.errors.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-red-600">
                                  Corrections
                                </h4>
                                {evaluationResult.errors.map((error, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-red-50 p-3 rounded border border-red-100"
                                  >
                                    <p className="text-red-800 font-medium line-through decoration-red-500">
                                      {error.text}
                                    </p>
                                    <p className="text-success font-medium mt-1">
                                      → {error.correction}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-1">
                                      {error.explanation}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                          <div className="bg-success/10 p-4 rounded-lg border border-success/20">
                            <h4 className="font-semibold text-success mb-2">
                              Better Version
                            </h4>
                            <p className="text-foreground italic">
                              {evaluationResult.better_version ||
                                evaluationResult.sample_response ||
                                evaluationResult.sample_essay}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
