"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { db } from "@/lib/db";
import {
  generateReadingQuestion,
  evaluateReading,
  GeneratedReadingTest,
  ReadingEvaluationResult,
  ReadingQuestion,
  ReadingPassage,
} from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Zap,
  FileText,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import Markdown from "react-markdown";

export default function ReadingPage() {
  const router = useRouter();
  const { geminiToken, geminiModel, currentUser } = useStore();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [selectedPart, setSelectedPart] = useState<5 | 6 | 7>(5);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Generated test data
  const [generatedTest, setGeneratedTest] =
    useState<GeneratedReadingTest | null>(null);
  console.log(generatedTest);
  // User answers
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});

  // Evaluation results
  const [evaluationResult, setEvaluationResult] =
    useState<ReadingEvaluationResult | null>(null);

  const handleGenerate = async () => {
    if (!geminiToken) {
      toast.error("Vui lòng cấu hình Gemini API Key trong Settings");
      return;
    }

    setIsGenerating(true);
    setGeneratedTest(null);
    setUserAnswers({});
    setEvaluationResult(null);
    setLoadingStatus("Starting generation...");

    try {
      let currentTest: GeneratedReadingTest = {
        part: selectedPart,
        questions: [],
        passages: [],
      };

      if (selectedPart === 5) {
        // Part 5: 30 questions (3 batches of 10)
        for (let i = 1; i <= 3; i++) {
          setLoadingStatus(`Generating batch ${i}/3...`);
          const result = await generateReadingQuestion(
            geminiToken,
            5,
            topic || undefined,
            geminiModel,
            i
          );

          if (result.questions) {
            currentTest.questions = [
              ...(currentTest.questions || []),
              ...result.questions,
            ];
            // Update state progressively
            setGeneratedTest({ ...currentTest });
          }

          // Wait 15s before next batch if not the last one
          if (i < 3) {
            setLoadingStatus(`Waiting 15s before next batch...`);
            await delay(15000);
          }
        }
      } else if (selectedPart === 6) {
        // Part 6: 16 questions (1 batch of 4 passages)
        setLoadingStatus("Generating passages...");
        const result = await generateReadingQuestion(
          geminiToken,
          6,
          topic || undefined,
          geminiModel
        );

        if (result.passages) {
          currentTest.passages = result.passages;
        } else if (result.passage) {
          // Fallback for single passage response
          currentTest.passages = [result.passage];
        }
        setGeneratedTest(currentTest);
      } else if (selectedPart === 7) {
        // Part 7: ~54 questions (3 batches)
        for (let i = 1; i <= 3; i++) {
          setLoadingStatus(`Generating batch ${i}/3...`);
          const result = await generateReadingQuestion(
            geminiToken,
            7,
            topic || undefined,
            geminiModel,
            i
          );

          if (result.passages) {
            currentTest.passages = [
              ...(currentTest.passages || []),
              ...result.passages,
            ];
            // Update state progressively
            setGeneratedTest({ ...currentTest });
          }

          // Wait 15s before next batch if not the last one
          if (i < 3) {
            setLoadingStatus(`Waiting 15s before next batch...`);
            await delay(15000);
          }
        }
      }

      toast.success("Đã tạo câu hỏi thành công!");
    } catch (error) {
      console.error("Error generating question:", error);
      toast.error("Không thể tạo câu hỏi. Vui lòng kiểm tra API Key.");
    } finally {
      setIsGenerating(false);
      setLoadingStatus("");
    }
  };

  const handleEvaluate = async () => {
    if (!geminiToken || !generatedTest) return;

    setIsEvaluating(true);

    try {
      let result: ReadingEvaluationResult;

      if (selectedPart === 5 && generatedTest.questions) {
        // Part 5 evaluation
        result = await evaluateReading(
          geminiToken,
          5,
          {
            questions: generatedTest.questions.map((q) => ({
              id: q.id,
              sentence: q.sentence || "",
              options: q.options,
              correctAnswer: q.correctAnswer,
              userAnswer: userAnswers[q.id] || "",
            })),
          },
          geminiModel
        );
      } else if (selectedPart === 6 && generatedTest.passages) {
        // Part 6 evaluation
        result = await evaluateReading(
          geminiToken,
          6,
          {
            passages: generatedTest.passages.map((p) => ({
              passageId: p.id,
              passageText: p.text,
              questions: p.questions.map((q) => ({
                id: q.id,
                blankNumber: q.blankNumber || 0,
                options: q.options,
                correctAnswer: q.correctAnswer,
                userAnswer: userAnswers[q.id] || "",
              })),
            })),
          },
          geminiModel
        );
      } else if (selectedPart === 7 && generatedTest.passages) {
        // Part 7 evaluation
        result = await evaluateReading(
          geminiToken,
          7,
          {
            part7Passages: generatedTest.passages.map((p) => ({
              passageId: p.id,
              passageType: p.passageType || "single",
              passageTexts: p.texts || [p.text],
              questions: p.questions.map((q) => ({
                id: q.id,
                questionText: q.questionText || "",
                questionType: q.questionType || "detail",
                options: q.options,
                correctAnswer: q.correctAnswer,
                userAnswer: userAnswers[q.id] || "",
              })),
            })),
          },
          geminiModel
        );
      } else {
        throw new Error("Invalid test data");
      }

      setEvaluationResult(result);

      if (currentUser) {
        await db.attempts.add({
          userId: currentUser.id,
          taskType: `part${selectedPart}` as any,
          userContent: JSON.stringify(userAnswers),
          questionContent: JSON.stringify(generatedTest),
          aiFeedback: result,
          score: result.scaledScore,
          timestamp: new Date(),
        });
      }

      toast.success("Đã chấm bài thành công!");
    } catch (error) {
      console.error("Error evaluating:", error);
      toast.error("Không thể chấm bài. Vui lòng thử lại.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const renderPart5Questions = () => {
    if (!generatedTest?.questions) return null;

    return (
      <div className="space-y-6">
        {generatedTest.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1}
                {question.grammarPoint && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({question.grammarPoint})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base font-medium">{question.sentence}</p>
              <div className="grid grid-cols-1 gap-2">
                {question.options.map((option, optIndex) => {
                  const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D
                  const isSelected = userAnswers[question.id] === optionLetter;
                  const isCorrect =
                    evaluationResult && question.correctAnswer === optionLetter;
                  const isWrong =
                    evaluationResult &&
                    userAnswers[question.id] === optionLetter &&
                    question.correctAnswer !== optionLetter;

                  return (
                    <button
                      key={optIndex}
                      onClick={() =>
                        !evaluationResult &&
                        handleAnswerChange(question.id, optionLetter)
                      }
                      disabled={!!evaluationResult}
                      className={`p-3 text-left border rounded-lg transition-all ${
                        isSelected && !evaluationResult
                          ? "border-blue-500 bg-blue-50"
                          : ""
                      } ${isCorrect ? "border-green-500 bg-green-50" : ""} ${
                        isWrong ? "border-red-500 bg-red-50" : ""
                      } ${
                        !evaluationResult
                          ? "hover:border-blue-300 cursor-pointer"
                          : "cursor-not-allowed"
                      }`}
                    >
                      <span className="font-semibold">{optionLetter}.</span>{" "}
                      {option}
                      {isCorrect && (
                        <CheckCircle2 className="inline ml-2 w-5 h-5 text-green-600" />
                      )}
                      {isWrong && (
                        <XCircle className="inline ml-2 w-5 h-5 text-red-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Show evaluation for this question */}
              {evaluationResult?.questionResults && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  {evaluationResult.questionResults
                    .filter((r) => r.questionId === question.id)
                    .map((result) => (
                      <div key={result.questionId} className="space-y-2">
                        <div
                          className={`flex items-center gap-2 font-semibold ${
                            result.isCorrect ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {result.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                          {result.isCorrect ? "Đúng" : "Sai"}
                        </div>
                        <p className="text-sm">
                          <strong>Giải thích:</strong> {result.explanation}
                        </p>
                        {result.grammarPoint && (
                          <p className="text-sm">
                            <strong>Điểm ngữ pháp:</strong>{" "}
                            {result.grammarPoint}
                          </p>
                        )}
                        {result.tip && (
                          <p className="text-sm">
                            <strong>Mẹo:</strong> {result.tip}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderPart6Passage = () => {
    if (!generatedTest?.passages) return null;

    return (
      <div className="space-y-6">
        {generatedTest.passages.map((passage) => (
          <div key={passage.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Passage {passage.id} - {passage.type}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {passage.text}
                  </div>
                </div>
              </CardContent>
            </Card>

            {passage.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {index + 1} - Blank [{question.blankNumber}]
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    {question.options.map((option, optIndex) => {
                      const optionLetter = String.fromCharCode(65 + optIndex);
                      const isSelected =
                        userAnswers[question.id] === optionLetter;
                      const isCorrect =
                        evaluationResult &&
                        question.correctAnswer === optionLetter;
                      const isWrong =
                        evaluationResult &&
                        userAnswers[question.id] === optionLetter &&
                        question.correctAnswer !== optionLetter;

                      return (
                        <button
                          key={optIndex}
                          onClick={() =>
                            !evaluationResult &&
                            handleAnswerChange(question.id, optionLetter)
                          }
                          disabled={!!evaluationResult}
                          className={`p-3 text-left border rounded-lg transition-all ${
                            isSelected && !evaluationResult
                              ? "border-blue-500 bg-blue-50"
                              : ""
                          } ${
                            isCorrect ? "border-green-500 bg-green-50" : ""
                          } ${isWrong ? "border-red-500 bg-red-50" : ""} ${
                            !evaluationResult
                              ? "hover:border-blue-300 cursor-pointer"
                              : "cursor-not-allowed"
                          }`}
                        >
                          <span className="font-semibold">{optionLetter}.</span>{" "}
                          {option}
                          {isCorrect && (
                            <CheckCircle2 className="inline ml-2 w-5 h-5 text-green-600" />
                          )}
                          {isWrong && (
                            <XCircle className="inline ml-2 w-5 h-5 text-red-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Show evaluation for this question */}
                  {evaluationResult?.passageResults && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      {evaluationResult.passageResults
                        .filter((pr) => pr.passageId === passage.id)
                        .flatMap((pr) => pr.questionResults)
                        .filter((r) => r.questionId === question.id)
                        .map((result) => (
                          <div key={result.questionId} className="space-y-2">
                            <div
                              className={`flex items-center gap-2 font-semibold ${
                                result.isCorrect
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {result.isCorrect ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <XCircle className="w-5 h-5" />
                              )}
                              {result.isCorrect ? "Đúng" : "Sai"}
                            </div>
                            <p className="text-sm">
                              <strong>Giải thích:</strong> {result.explanation}
                            </p>
                            {result.coherenceNote && (
                              <p className="text-sm">
                                <strong>Liên kết:</strong>{" "}
                                {result.coherenceNote}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const renderPart7Passages = () => {
    if (!generatedTest?.passages) return null;

    return (
      <div className="space-y-6">
        {generatedTest.passages.map((passage) => (
          <div key={passage.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  Passage {passage.id} - {passage.passageType || "Single"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none space-y-4">
                  {(passage.texts || [passage.text]).map((text, idx) => (
                    <div
                      key={idx}
                      className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg"
                    >
                      {text}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {passage.questions.map((question, qIndex) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {qIndex + 1}
                    {question.questionType && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        ({question.questionType})
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-base font-medium">
                    {question.questionText}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {question.options.map((option, optIndex) => {
                      const optionLetter = String.fromCharCode(65 + optIndex);
                      const isSelected =
                        userAnswers[question.id] === optionLetter;
                      const isCorrect =
                        evaluationResult &&
                        question.correctAnswer === optionLetter;
                      const isWrong =
                        evaluationResult &&
                        userAnswers[question.id] === optionLetter &&
                        question.correctAnswer !== optionLetter;

                      return (
                        <button
                          key={optIndex}
                          onClick={() =>
                            !evaluationResult &&
                            handleAnswerChange(question.id, optionLetter)
                          }
                          disabled={!!evaluationResult}
                          className={`p-3 text-left border rounded-lg transition-all ${
                            isSelected && !evaluationResult
                              ? "border-blue-500 bg-blue-50"
                              : ""
                          } ${
                            isCorrect ? "border-green-500 bg-green-50" : ""
                          } ${isWrong ? "border-red-500 bg-red-50" : ""} ${
                            !evaluationResult
                              ? "hover:border-blue-300 cursor-pointer"
                              : "cursor-not-allowed"
                          }`}
                        >
                          <span className="font-semibold">{optionLetter}.</span>{" "}
                          {option}
                          {isCorrect && (
                            <CheckCircle2 className="inline ml-2 w-5 h-5 text-green-600" />
                          )}
                          {isWrong && (
                            <XCircle className="inline ml-2 w-5 h-5 text-red-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Show evaluation for this question */}
                  {evaluationResult?.passageResults && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      {evaluationResult.passageResults
                        .flatMap((pr) => pr.questionResults)
                        .filter((r) => r.questionId === question.id)
                        .map((result) => (
                          <div key={result.questionId} className="space-y-2">
                            <div
                              className={`flex items-center gap-2 font-semibold ${
                                result.isCorrect
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {result.isCorrect ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : (
                                <XCircle className="w-5 h-5" />
                              )}
                              {result.isCorrect ? "Đúng" : "Sai"}
                            </div>
                            {result.evidence && (
                              <p className="text-sm italic bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                                <strong>Bằng chứng:</strong> {result.evidence}
                              </p>
                            )}
                            <p className="text-sm">
                              <strong>Giải thích:</strong> {result.explanation}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TOEIC Reading Practice
              </h1>
              <p className="text-muted-foreground">
                Practice Parts 5, 6, and 7 with AI-powered feedback
              </p>
            </div>
          </div>
        </div>

        {/* Generation Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Generate Practice Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Part
                </label>
                <Tabs
                  value={selectedPart.toString()}
                  onValueChange={(v) =>
                    setSelectedPart(parseInt(v) as 5 | 6 | 7)
                  }
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="5">Part 5</TabsTrigger>
                    <TabsTrigger value="6">Part 6</TabsTrigger>
                    <TabsTrigger value="7">Part 7</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Topic (Optional)
                </label>
                <Input
                  placeholder="e.g., Business, Travel..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !geminiToken}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {loadingStatus || "Generating..."}
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Questions Display */}
        {generatedTest && (
          <>
            <div className="mb-6">
              {selectedPart === 5 && renderPart5Questions()}
              {selectedPart === 6 && renderPart6Passage()}
              {selectedPart === 7 && renderPart7Passages()}
            </div>

            {/* Submit Button */}
            {!evaluationResult && (
              <Button
                onClick={handleEvaluate}
                disabled={isEvaluating || Object.keys(userAnswers).length === 0}
                className="w-full"
                size="lg"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Submit Answers
                  </>
                )}
              </Button>
            )}

            {/* Overall Results */}
            {evaluationResult && (
              <Card className="mt-6 border-2 border-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks className="w-6 h-6" />
                    Your Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        {evaluationResult.correctAnswers}/
                        {evaluationResult.totalQuestions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Correct Answers
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {evaluationResult.scaledScore}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Est. TOEIC Score (5-495)
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">
                        {Math.round(
                          (evaluationResult.correctAnswers /
                            evaluationResult.totalQuestions) *
                            100
                        )}
                        %
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Accuracy
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">
                        {evaluationResult.proficiencyLevel || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Proficiency Level
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Overall Feedback</h3>
                    <p>
                      <Markdown>{evaluationResult?.feedback || ""}</Markdown>
                    </p>
                  </div>

                  <Button
                    onClick={() => {
                      setGeneratedTest(null);
                      setUserAnswers({});
                      setEvaluationResult(null);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Practice Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Empty State */}
        {!generatedTest && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Ready to Practice Reading?
              </h3>
              <p className="text-muted-foreground max-w-md">
                Select a part, choose your target level, and generate practice
                questions to start improving your TOEIC Reading skills.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
