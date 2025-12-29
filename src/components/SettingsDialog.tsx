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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="gemini-model">Model</Label>
            <Select value={currentModel} onValueChange={setCurrentModel}>
              <SelectTrigger id="gemini-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini-2.0-flash">
                  Gemini 2.0 Flash
                </SelectItem>
                <SelectItem value="gemini-2.0-pro-exp-02-05">
                  Gemini 2.0 Pro Experimental
                </SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
              </SelectContent>
            </Select>
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
