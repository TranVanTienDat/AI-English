import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/db";

interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  geminiToken: string | null;
  setGeminiToken: (token: string | null) => void;
  geminiModel: string;
  setGeminiModel: (model: string) => void;
  aiPrompt: string | null;
  setAiPrompt: (prompt: string | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      geminiToken: null,
      setGeminiToken: (token) => set({ geminiToken: token }),
      geminiModel: "gemini-1.5-flash",
      setGeminiModel: (model) => set({ geminiModel: model }),
      aiPrompt: null,
      setAiPrompt: (prompt) => set({ aiPrompt: prompt }),
    }),
    {
      name: "toeic-app-storage",
      partialize: (state) => ({
        currentUser: state.currentUser,
        geminiToken: state.geminiToken,
        geminiModel: state.geminiModel,
        aiPrompt: state.aiPrompt,
      }),
    }
  )
);
