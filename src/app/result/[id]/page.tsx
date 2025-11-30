"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Trophy,
  Target,
  Layout,
  Type,
  ListChecks,
  Sparkles,
  FileText,
  AlertTriangle,
  Check,
} from "lucide-react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const attempt = useLiveQuery(() => db.attempts.get(Number(id)), [id]);

  if (!attempt)
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  const { score = 0, aiFeedback, userContent, taskType } = attempt;
  const maxScore = taskType === "task1" ? 3 : taskType === "task2" ? 4 : 5;

  // Calculate percentage for circular progress or visual bar
  const scorePercentage = (score / maxScore) * 100;

  // Determine color based on score
  const getScoreColor = (percent: number) => {
    if (percent >= 80) return "text-green-600 dark:text-green-400";
    if (percent >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="-ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <h1 className="text-lg font-semibold hidden sm:block">
              Result Analysis
            </h1>
          </div>
          <Badge
            variant="outline"
            className="uppercase tracking-wider font-mono"
          >
            {taskType === "task1"
              ? "Picture Description"
              : taskType === "task2"
              ? "Email Response"
              : "Opinion Essay"}
          </Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Top Section: Score & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Card */}
          <Card className="overflow-hidden relative border-none shadow-lg bg-gradient-to-br from-primary/10 via-primary/5 to-background">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy size={120} />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-muted-foreground">
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    "text-7xl font-bold tracking-tighter",
                    getScoreColor(scorePercentage)
                  )}
                >
                  {score}
                </span>
                <span className="text-2xl text-muted-foreground font-light">
                  / {maxScore}
                </span>
              </div>
              {aiFeedback?.proficiencyLevel && (
                <Badge className="mt-4 bg-primary/20 text-primary hover:bg-primary/30 border-none text-sm px-3 py-1">
                  {aiFeedback.proficiencyLevel} Level
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* General Feedback */}
          <Card className="md:col-span-2 border-none shadow-md bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                AI Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {aiFeedback?.feedback || "No feedback available."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Task Specific Analysis */}
        {taskType === "task1" && aiFeedback?.keywords_used && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Keyword Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {Object.entries(aiFeedback.keywords_used).map(([key, used]) => (
                  <Badge
                    key={key}
                    variant={used ? "default" : "destructive"}
                    className="px-3 py-1 text-sm flex items-center gap-2"
                  >
                    {used ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <AlertCircle size={14} />
                    )}
                    {key}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {taskType === "task2" && aiFeedback?.requests_answered && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Task Completion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">
                    Requests Answered
                  </span>
                  <span className="font-bold">
                    {aiFeedback.requests_answered.answered} /{" "}
                    {aiFeedback.requests_answered.total_requests}
                  </span>
                </div>
                {aiFeedback.requests_answered.missing &&
                  aiFeedback.requests_answered.missing.length > 0 && (
                    <div className="bg-destructive/10 p-3 rounded-md text-sm text-destructive">
                      <strong>Missing:</strong>{" "}
                      {aiFeedback.requests_answered.missing.join(", ")}
                    </div>
                  )}
              </CardContent>
            </Card>

            {aiFeedback?.format_check && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-primary" />
                    Format Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Greeting</span>
                    {aiFeedback.format_check.has_greeting ? (
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    ) : (
                      <AlertCircle className="text-red-500 h-5 w-5" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Closing</span>
                    {aiFeedback.format_check.has_closing ? (
                      <CheckCircle2 className="text-green-500 h-5 w-5" />
                    ) : (
                      <AlertCircle className="text-red-500 h-5 w-5" />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {taskType === "task3" && aiFeedback?.structure_analysis && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                Essay Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(aiFeedback.structure_analysis).map(
                  ([key, present]) => (
                    <div
                      key={key}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-lg border",
                        present
                          ? "bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                          : "bg-red-50/50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                      )}
                    >
                      {present ? (
                        <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                      )}
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {key.replace("has_", "").replace(/_/g, " ")}
                      </span>
                    </div>
                  )
                )}
              </div>
              {aiFeedback.word_count && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Word Count:{" "}
                  <span className="font-mono font-bold text-foreground">
                    {aiFeedback.word_count}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="corrections" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] lg:mx-auto mb-8">
            <TabsTrigger value="corrections">Corrections</TabsTrigger>
            <TabsTrigger value="better">Model Answer</TabsTrigger>
            <TabsTrigger value="original">Original</TabsTrigger>
          </TabsList>

          <TabsContent
            value="corrections"
            className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            {aiFeedback?.errors?.length > 0 ? (
              <div className="grid gap-4">
                {aiFeedback.errors.map((error: any, index: number) => (
                  <Card
                    key={index}
                    className="overflow-hidden border-l-4 border-l-destructive shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2 space-y-2">
                          <div className="flex items-center gap-2 text-destructive font-semibold mb-1">
                            <AlertTriangle size={16} />
                            <span>Issue</span>
                          </div>
                          <div className="p-3 bg-destructive/5 rounded-md text-destructive-foreground/90 font-medium border border-destructive/10">
                            "{error.text}"
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {error.explanation}
                          </p>
                        </div>

                        <div className="hidden md:flex items-center justify-center">
                          <div className="p-2 rounded-full bg-muted">
                            <ArrowLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                          </div>
                        </div>

                        <div className="md:w-1/2 space-y-2">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold mb-1">
                            <Check size={16} />
                            <span>Correction</span>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md text-green-700 dark:text-green-300 font-medium border border-green-100 dark:border-green-800">
                            "{error.correction}"
                          </div>
                          {error.type && (
                            <Badge variant="outline" className="text-xs">
                              {error.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="h-20 w-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">Excellent Work!</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We couldn't find any significant errors in your writing. You
                    demonstrated great control over grammar and vocabulary.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="better"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <BookOpen size={20} />
                  Suggested Improvement
                </CardTitle>
                <CardDescription>
                  A more natural or advanced way to express your ideas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="p-6 bg-background/50 rounded-xl border shadow-sm">
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                      {aiFeedback?.better_version ||
                        aiFeedback?.sample_response ||
                        aiFeedback?.sample_essay ||
                        "No sample available."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="original"
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <FileText size={20} />
                  Your Submission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 bg-muted/30 rounded-xl border">
                  <p className="whitespace-pre-wrap leading-relaxed font-serif text-lg text-foreground/80">
                    {userContent}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
