"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export function LoginView() {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setCurrentUser = useStore((state) => state.setCurrentUser);

  const handleLogin = async () => {
    if (!name.trim()) return;
    setIsLoading(true);

    try {
      // Check if user exists or create new
      let user = await db.users.where("name").equals(name).first();

      if (!user) {
        const id = await db.users.add({
          name,
          createdAt: new Date(),
        });
        user = { id: Number(id), name, createdAt: new Date() };
      }

      setCurrentUser(user);

      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-foreground">
            Welcome to TOEIC AI
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Master TOEIC Writing with Gemini AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200"
            onClick={handleLogin}
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Starting..." : "Start Practicing"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
