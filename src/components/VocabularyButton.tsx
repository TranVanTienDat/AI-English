"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { VocabularyDrawer } from "./VocabularyDrawer";

export function VocabularyButton() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed bottom-6 right-6 z-30 px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-semibold hover:scale-105"
        aria-label="Từ vựng"
      >
        <BookOpen className="w-5 h-5" />
        <span className="hidden sm:inline">Từ vựng</span>
      </button>

      <VocabularyDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
