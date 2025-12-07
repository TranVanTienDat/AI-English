"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { useStore } from "@/store/useStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpenText,
  History,
  NotebookPen,
  Zap,
  TrendingUp,
  BrainCircuit,
  Loader2,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { analyzeProgress, ProgressAnalysis } from "@/lib/gemini";
import { processAttemptsForAI } from "@/lib/analytics";
import { toast } from "sonner";
import Markdown from "react-markdown";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const currentUser = useStore((state) => state.currentUser);
  const geminiToken = useStore((state) => state.geminiToken);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);

  const attempts = useLiveQuery(
    () =>
      db.attempts
        .where("userId")
        .equals(currentUser?.id || 0)
        .reverse()
        .limit(20) // Fetch more for analysis, but display only 5 in history list
        .toArray(),
    [currentUser?.id]
  );

  const handleAnalyze = async () => {
    if (!attempts || attempts.length === 0) {
      toast.error("No practice history to analyze.");
      return;
    }
    if (!geminiToken) {
      toast.error("Please set your Gemini API Key in Settings first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const reducedData = processAttemptsForAI(attempts);
      const result = await analyzeProgress(geminiToken, reducedData);
      setAnalysis(result);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze progress.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Analysis Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BrainCircuit size={24} className="text-primary" /> AI Progress
            Insight
          </h2>
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !attempts?.length}
            className="gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <TrendingUp size={16} />
            )}
            Analyze My Progress
          </Button>
        </div>

        {analysis && (
          <Card className="bg-linear-to-br from-card to-accent/10 border-primary/20 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Performance Summary
                <span
                  className={`text-sm px-2 py-1 rounded-full border ${
                    analysis.trend === "improving"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : analysis.trend === "declining"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  }`}
                >
                  {analysis.trend.toUpperCase()}
                </span>
              </CardTitle>
              <CardDescription className="text-base">
                {analysis.summary}
              </CardDescription>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-primary">Level</h4>
                {analysis?.level && (
                  <Badge variant="destructive" className="text-base">
                    {analysis.level}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-primary">Strengths</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {analysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-red-500">
                  Areas for Improvement
                </h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2 mt-4 bg-background/50 p-4 rounded-lg border border-border">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" /> Actionable
                  Advice
                </h4>
                <p>
                  <Markdown>{analysis?.advice || ""}</Markdown>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Zap size={24} className="text-primary" /> Tools & Resources
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Generate Questions Card */}
        <Link href="/writing" className="block group">
          <Card className="h-full hover:shadow-lg transition-all duration-300 border-border overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-lg bg-success flex items-center justify-center group-hover:scale-110 transition-transform">
                  <NotebookPen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">
                  Generate Writing Question
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                AI creates a new writing question (Part 1, 2, or 3) for you to
                practice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full justify-between group-hover:bg-accent"
              >
                Start Practice <ArrowRight size={16} />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reading" className="block group">
          <Card className="h-full hover:shadow-lg transition-all duration-300 border-border overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-lg bg-success flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpenText className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl">
                  Generate Reading Question
                </CardTitle>
              </div>
              <CardDescription className="text-base">
                AI creates reading questions (Part 5, 6, or 7) for you to
                practice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full justify-between group-hover:bg-accent"
              >
                Start Practice <ArrowRight size={16} />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/practice/translation" className="block group">
          <Card className="h-full hover:shadow-lg transition-all duration-300 border-border overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen size={24} className="text-white" />
                </div>
                <CardTitle className="text-2xl">Translation Practice</CardTitle>
              </div>
              <CardDescription className="text-base">
                Luyện dịch Việt - Anh với AI, mở rộng vốn từ vựng của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                className="w-full justify-between group-hover:bg-accent"
              >
                Bắt đầu <ArrowRight size={16} />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History size={24} /> Recent History
          </h2>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {attempts && attempts.length > 0 ? (
            <div className="divide-y divide-border">
              {attempts.slice(0, 5).map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 hover:bg-accent transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {attempt.taskType === "task1"
                        ? "Writing: Picture Sentence"
                        : attempt.taskType === "task2"
                        ? "Writing: Email Response"
                        : attempt.taskType === "task3"
                        ? "Writing: Opinion Essay"
                        : attempt.taskType === "part5"
                        ? "Reading: Incomplete Sentences"
                        : attempt.taskType === "part6"
                        ? "Reading: Text Completion"
                        : "Reading: Comprehension"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(attempt.timestamp).toLocaleDateString()} •
                      Score: {attempt.score ?? "N/A"}
                    </div>
                  </div>
                  <Link href={`/result/${attempt.id}`}>
                    <Button size="sm" variant="outline">
                      View Result
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No practice attempts yet. Start one above!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
