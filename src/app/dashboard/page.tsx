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
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const currentUser = useStore((state) => state.currentUser);

  const attempts = useLiveQuery(
    () =>
      db.attempts
        .where("userId")
        .equals(currentUser?.id || 0)
        .reverse()
        .limit(5)
        .toArray(),
    [currentUser?.id]
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Zap size={24} className="text-warning" /> Tools & Resources
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Generate Questions Card */}
          <Link href="/writing" className="block group">
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-border overflow-hidden">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <NotebookPen className="w-6 h-6 text-foreground" />
                </div>
                <CardTitle className="text-xl">
                  Generate Writing Question
                </CardTitle>
                <CardDescription>
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
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpenText className="w-6 h-6 text-foreground" />
                </div>
                <CardTitle className="text-xl">
                  Generate Reading Question
                </CardTitle>
                <CardDescription>
                  AI creates a new reading question (Part 1, 2, or 3) for you to
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
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <History size={24} /> Recent History
          </h2>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          {attempts && attempts.length > 0 ? (
            <div className="divide-y divide-border">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 hover:bg-accent transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-foreground">
                      {attempt.taskType === "task1"
                        ? "Picture Sentence"
                        : attempt.taskType === "task2"
                        ? "Email Response"
                        : "Opinion Essay"}
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
