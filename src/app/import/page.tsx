"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ImportPage() {
  const router = useRouter();
  const [fileContent, setFileContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setSuccess("");

    const reader = new FileReader();
    reader.onload = () => {
      setFileContent(reader.result as string);
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!fileContent) return;
    try {
      const questions = JSON.parse(fileContent);
      if (!Array.isArray(questions)) throw new Error("JSON must be an array");

      // Validation
      const validQuestions = questions.filter((q: any) => {
        return (
          q.type &&
          ["task1", "task2", "task3"].includes(q.type) &&
          q.content &&
          (!q.level || ["basic", "intermediate", "advanced"].includes(q.level))
        );
      });

      if (validQuestions.length === 0) {
        throw new Error("No valid questions found in the file.");
      }

      // Remove IDs to let Dexie auto-increment
      const questionsToImport = validQuestions.map(
        ({ id, ...rest }: any) => rest
      );

      await db.questions.bulkAdd(questionsToImport);
      setSuccess(`Successfully imported ${validQuestions.length} questions!`);
      setFileContent("");
      setFileName("");

      // Optional: Redirect after a delay
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (e: any) {
      setError(e.message || "Invalid JSON format");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="pl-0 hover:pl-2 transition-all">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Import Question Bank</CardTitle>
            <CardDescription>
              Upload a JSON file containing an array of questions to add to your
              local database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-accent transition-colors">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <span className="text-sm font-medium text-foreground">
                  {fileName || "Click to upload JSON file"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {fileName ? "Click to change file" : "or drag and drop"}
                </span>
              </label>
            </div>

            {error && (
              <div className="flex items-center p-4 text-destructive bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center p-4 text-success bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">{success}</span>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleImport}
              disabled={!fileContent || !!success}
              className="w-full"
            >
              Import Questions
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
