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
import { ArrowRight, History, Zap } from "lucide-react";
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
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <Zap size={24} className="text-amber-500" /> Tools & Resources
        </h2>
        <div className="grid grid-cols-1 gap-6">
          {/* Generate Questions Card */}
          <Link href="/generate" className="block group">
            <Card className="h-full hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="h-2 w-full bg-emerald-500" />
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-emerald-500 bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-emerald-500" />
                </div>
                <CardTitle className="text-xl">
                  Generate Practice Question
                </CardTitle>
                <CardDescription>
                  AI creates a new practice topic or question for you to write
                  about.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="w-full justify-between group-hover:bg-slate-50 dark:group-hover:bg-slate-800"
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
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <History size={24} /> Recent History
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {attempts && attempts.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {attempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {attempt.taskType === "task1"
                        ? "Picture Sentence"
                        : attempt.taskType === "task2"
                        ? "Email Response"
                        : "Opinion Essay"}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
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
            <div className="p-8 text-center text-slate-500">
              No practice attempts yet. Start one above!
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
