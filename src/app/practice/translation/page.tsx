"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Settings,
  Send,
  ArrowRight,
  Sparkles,
  CheckCircle,
  XCircle,
  Lightbulb,
  Save,
  RefreshCw,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import {
  generateVietnamesePassages,
  evaluateTranslation,
  type VietnamesePassage,
  type TranslationEvaluation,
} from "@/lib/gemini";
import { db } from "@/lib/db";

type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";
type PassageLength = "20-30" | "40-50" | "60-80";

type ViewState = "setup" | "practicing" | "feedback" | "completed";

export default function TranslationPracticePage() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const geminiToken = useStore((state) => state.geminiToken);
  const geminiModel = useStore((state) => state.geminiModel);

  // Setup states
  const [proficiencyLevel, setProficiencyLevel] =
    useState<ProficiencyLevel>("Intermediate");
  const [passageLength, setPassageLength] = useState<PassageLength>("40-50");

  // Practice states
  const [viewState, setViewState] = useState<ViewState>("setup");
  const [passages, setPassages] = useState<VietnamesePassage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTranslation, setUserTranslation] = useState("");
  const [evaluation, setEvaluation] = useState<TranslationEvaluation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push("/");
    }
  }, [currentUser, router]);

  const handleStartPractice = async () => {
    if (!geminiToken) {
      setError("Vui lòng cấu hình API key trong Settings");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generatedPassages = await generateVietnamesePassages(
        geminiToken,
        proficiencyLevel,
        passageLength,
        10,
        geminiModel
      );
      setPassages(generatedPassages);
      setCurrentIndex(0);
      setViewState("practicing");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tạo đoạn văn. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitTranslation = async () => {
    if (!geminiToken || !userTranslation.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentPassage = passages[currentIndex];
      const result = await evaluateTranslation(
        geminiToken,
        currentPassage.vietnamese,
        userTranslation,
        proficiencyLevel,
        currentPassage.targetVocabulary.map((v) => ({
          vietnamese: v.vietnamese,
          english: v.english,
        })),
        geminiModel
      );
      setEvaluation(result);
      setViewState("feedback");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể đánh giá bài dịch. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    if (currentIndex < passages.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserTranslation("");
      setEvaluation(null);
      setViewState("practicing");
    } else {
      setViewState("completed");
    }
  };

  const handleSaveVocabulary = async (
    vietnamese: string,
    english: string,
    context?: string
  ) => {
    if (!currentUser) return;

    try {
      await db.vocabulary.add({
        userId: currentUser.id,
        vietnamese,
        english,
        context,
        proficiencyLevel,
        addedAt: new Date(),
      });
    } catch (err) {
      console.error("Failed to save vocabulary:", err);
    }
  };

  const handleRestart = () => {
    setViewState("setup");
    setPassages([]);
    setCurrentIndex(0);
    setUserTranslation("");
    setEvaluation(null);
    setError(null);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Luyện Dịch Việt - Anh
              </h1>
              <p className="text-gray-600 mt-1">
                Rèn luyện kỹ năng dịch thuật và mở rộng vốn từ vựng
              </p>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl text-red-700 flex items-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Setup View */}
        {viewState === "setup" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Cài đặt luyện tập
              </h2>
            </div>

            <div className="space-y-6">
              {/* Level Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Trình độ hiện tại
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(
                    ["Beginner", "Intermediate", "Advanced", "Expert"] as const
                  ).map((level) => (
                    <button
                      key={level}
                      onClick={() => setProficiencyLevel(level)}
                      className={`p-4 rounded-xl font-semibold transition-all ${
                        proficiencyLevel === level
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Độ dài đoạn văn (số từ)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["20-30", "40-50", "60-80"] as const).map((length) => (
                    <button
                      key={length}
                      onClick={() => setPassageLength(length)}
                      className={`p-4 rounded-xl font-semibold transition-all ${
                        passageLength === length
                          ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {length} từ
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartPractice}
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Đang tạo đoạn văn...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Bắt đầu luyện tập
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Practicing View */}
        {viewState === "practicing" && passages[currentIndex] && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-gray-600">
                  Tiến độ
                </span>
                <span className="text-sm font-bold text-purple-600">
                  {currentIndex + 1} / {passages.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentIndex + 1) / passages.length) * 100}%`,
                  }}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full"
                />
              </div>
            </div>

            {/* Vietnamese Passage */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-semibold">
                  {passages[currentIndex].topic}
                </div>
              </div>
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-medium">
                {passages[currentIndex].vietnamese}
              </p>
            </div>

            {/* Translation Input */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Dịch sang tiếng Anh
              </label>
              <textarea
                value={userTranslation}
                onChange={(e) => setUserTranslation(e.target.value)}
                placeholder="Nhập bản dịch của bạn ở đây..."
                className="w-full h-40 p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-lg"
              />
              <button
                onClick={handleSubmitTranslation}
                disabled={!userTranslation.trim() || isLoading}
                className="mt-4 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Đang chấm điểm...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Nộp bài
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* Feedback View */}
        {viewState === "feedback" && evaluation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Score Card */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="text-center">
                <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
                  {evaluation.score >= 75 ? (
                    <CheckCircle className="w-12 h-12" />
                  ) : (
                    <Lightbulb className="w-12 h-12" />
                  )}
                </div>
                <h2 className="text-5xl font-bold mb-2">
                  {evaluation.score}/100
                </h2>
                <p className="text-xl opacity-90">{evaluation.feedback}</p>
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-2 text-purple-600">
                  ✓ Độ chính xác
                </h3>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {evaluation.accuracy.score}/25
                </div>
                <p className="text-sm text-gray-600">
                  {evaluation.accuracy.comment}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-2 text-blue-600">
                  ✓ Ngữ pháp
                </h3>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {evaluation.grammar.score}/25
                </div>
                <p className="text-sm text-gray-600">
                  {evaluation.grammar.errors.length === 0
                    ? "Không có lỗi!"
                    : `${evaluation.grammar.errors.length} lỗi cần sửa`}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-2 text-pink-600">
                  ✓ Từ vựng
                </h3>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {evaluation.vocabulary.score}/25
                </div>
                <p className="text-sm text-gray-600">
                  {evaluation.vocabulary.newWords.length} từ vựng mới
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-2 text-green-600">
                  ✓ Tự nhiên
                </h3>
                <div className="text-3xl font-bold text-gray-800 mb-2">
                  {evaluation.naturalness.score}/25
                </div>
                <p className="text-sm text-gray-600">
                  {evaluation.naturalness.comment}
                </p>
              </div>
            </div>

            {/* Grammar Errors */}
            {evaluation.grammar.errors.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 text-red-600 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Lỗi ngữ pháp
                </h3>
                <div className="space-y-3">
                  {evaluation.grammar.errors.map((error, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-red-50 border-l-4 border-red-500 rounded"
                    >
                      <p className="text-red-700 line-through mb-1">
                        {error.text}
                      </p>
                      <p className="text-green-700 font-semibold mb-2">
                        → {error.correction}
                      </p>
                      <p className="text-sm text-gray-600">
                        {error.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Better Version */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md p-6 border-2 border-green-200">
              <h3 className="font-bold text-lg mb-3 text-green-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Bản dịch gợi ý
              </h3>
              <p className="text-lg text-gray-800 leading-relaxed">
                {evaluation.better_version}
              </p>
            </div>

            {/* New Vocabulary */}
            {evaluation.vocabulary.newWords.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-bold text-lg mb-4 text-purple-600 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Từ vựng mới
                </h3>
                <div className="grid gap-3">
                  {evaluation.vocabulary.newWords.map((word, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-purple-50 rounded-lg border border-purple-200 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-bold text-purple-700">
                            {word.vietnamese}
                          </span>
                          <span className="text-gray-400">→</span>
                          <span className="font-semibold text-blue-600">
                            {word.english}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 italic">
                          "{word.context}"
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleSaveVocabulary(
                            word.vietnamese,
                            word.english,
                            word.context
                          )
                        }
                        className="ml-2 p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {currentIndex < passages.length - 1 ? (
                <>
                  Tiếp tục
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Hoàn thành
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Completed View */}
        {viewState === "completed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            <div className="inline-block p-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Chúc mừng! Bạn đã hoàn thành 10 đoạn văn!
            </h2>
            <p className="text-gray-600 mb-8">
              Hãy tiếp tục luyện tập để cải thiện kỹ năng dịch thuật của bạn
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleStartPractice}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isLoading ? "Đang tạo..." : "Luyện thêm 10 đoạn"}
              </button>
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Về trang chủ
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
