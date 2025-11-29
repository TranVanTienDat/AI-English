"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Need tabs
import { ArrowLeft, CheckCircle, AlertCircle, BookOpen } from "lucide-react";
import { Loader2 } from "lucide-react";

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
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );

  const { score, aiFeedback, userContent } = attempt;
  const maxScore =
    attempt.taskType === "task1" ? 3 : attempt.taskType === "task2" ? 4 : 5;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <h1 className="text-2xl font-bold">Result Analysis</h1>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-linear-to-br from-blue-600 to-blue-800 text-white border-none">
          <CardHeader>
            <CardTitle className="text-blue-100">Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-2">
            <span className="text-6xl font-bold">{score}</span>
            <span className="text-2xl text-blue-200 mb-2">/ {maxScore}</span>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>General Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {aiFeedback?.feedback || "No feedback available."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="corrections" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="corrections">Corrections & Errors</TabsTrigger>
          <TabsTrigger value="better">Better Version</TabsTrigger>
          <TabsTrigger value="original">Your Original</TabsTrigger>
        </TabsList>

        <TabsContent value="corrections" className="mt-6 space-y-6">
          <div className="grid gap-4">
            {aiFeedback?.errors?.length > 0 ? (
              aiFeedback.errors.map((error: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className="text-red-500 mt-1 shrink-0"
                        size={20}
                      />
                      <div>
                        <div className="font-mono text-sm bg-red-50 text-red-700 px-2 py-1 rounded w-fit mb-2">
                          {error.text}
                        </div>
                        <p className="font-semibold text-green-600 mb-1">
                          Correction: {error.correction}
                        </p>
                        <p className="text-slate-600 text-sm">
                          {error.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 flex items-center gap-4 text-green-700">
                  <CheckCircle size={24} />
                  <div>
                    <p className="font-semibold">Perfect!</p>
                    <p>No significant errors found in your writing.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="better" className="mt-6">
          <Card className="bg-blue-50/50 border-blue-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <BookOpen size={20} /> Model Answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-blue max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-slate-800">
                  {aiFeedback?.better_version ||
                    aiFeedback?.sample_response ||
                    aiFeedback?.sample_essay ||
                    "No sample available."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="original" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap leading-relaxed font-serif text-lg">
                {userContent}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
