"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { toast } from "sonner";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const {
    geminiToken,
    aiPrompt,
    geminiModel,
    setGeminiToken,
    setAiPrompt,
    setGeminiModel,
  } = useStore();
  const [currentToken, setCurrentToken] = useState(geminiToken || "");
  const [currentPrompt, setCurrentPrompt] = useState(aiPrompt || "");
  const [currentModel, setCurrentModel] = useState(
    geminiModel || "gemini-2.5-flash"
  );

  useEffect(() => {
    if (open) {
      setCurrentToken(geminiToken || "");
      setCurrentPrompt(aiPrompt || "");
      setCurrentModel(geminiModel || "gemini-2.5-flash");
    }
  }, [open, geminiToken, aiPrompt, geminiModel]);

  const handleSave = () => {
    setGeminiToken(currentToken);
    setAiPrompt(currentPrompt);
    setGeminiModel(currentModel);
    toast.success("Settings saved successfully!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and AI configuration here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <Label htmlFor="gemini-token" className="flex-1">
              Gemini Token
            </Label>
            <Input
              id="gemini-token"
              type="password"
              value={currentToken}
              onChange={(e) => setCurrentToken(e.target.value)}
              placeholder="Enter your Gemini API Key"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Label htmlFor="gemini-model" className="flex-1">
              Model
            </Label>
            <select
              id="gemini-model"
              value={currentModel}
              onChange={(e) => setCurrentModel(e.target.value)}
              className="col-span-3 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="gemini-3-pro-preview">
                Gemini 3 Pro (Preview)
              </option>
            </select>
          </div>
          <div className="flex flex-col gap-4">
            <Label htmlFor="ai-prompt" className="text-right">
              AI Prompt
            </Label>
            <Textarea
              id="ai-prompt"
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              className="col-span-3"
              rows={6}
              placeholder="Provide instructions for the AI..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
