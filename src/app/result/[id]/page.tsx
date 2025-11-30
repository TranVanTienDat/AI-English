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
        <Card className="bg-linear-to-br from-primary to-primary/80 text-primary-foreground border-none">
          <CardHeader>
            <CardTitle className="text-primary-foreground/80">
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end gap-2">
            <span className="text-6xl font-bold">{score}</span>
            <span className="text-2xl text-primary-foreground/60 mb-2">
              / {maxScore}
            </span>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>General Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
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
                <Card key={index} className="border-l-4 border-l-destructive">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className="text-destructive mt-1 shrink-0"
                        size={20}
                      />
                      <div>
                        <div className="font-mono text-sm bg-destructive/10 text-destructive px-2 py-1 rounded w-fit mb-2">
                          {error.text}
                        </div>
                        <p className="font-semibold text-success mb-1">
                          Correction: {error.correction}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {error.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="bg-success/10 border-success/20">
                <CardContent className="pt-6 flex items-center gap-4 text-success">
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
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <BookOpen size={20} /> Model Answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">
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
