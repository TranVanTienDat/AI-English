"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, Search, Trash2, Plus } from "lucide-react";
import { db, Vocabulary } from "@/lib/db";
import { useStore } from "@/store/useStore";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";

interface VocabularyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VocabularyDrawer({ isOpen, onClose }: VocabularyDrawerProps) {
  const currentUser = useStore((state) => state.currentUser);
  const [searchTerm, setSearchTerm] = useState("");

  // New vocabulary form state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVietnamese, setNewVietnamese] = useState("");
  const [newEnglish, setNewEnglish] = useState("");
  const [newContext, setNewContext] = useState("");

  const vocabularyList = useLiveQuery(async () => {
    if (!currentUser) return [];
    return await db.vocabulary
      .where("userId")
      .equals(currentUser.id)
      .reverse()
      .sortBy("addedAt");
  }, [currentUser]);

  const filteredVocabulary = vocabularyList?.filter(
    (vocab) =>
      vocab.vietnamese.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vocab.english.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      await db.vocabulary.delete(id);
      toast.success("Đã xóa từ vựng");
    } catch (error) {
      toast.error("Không thể xóa từ vựng");
    }
  };

  const handleAddNew = async () => {
    if (!currentUser || !newVietnamese.trim() || !newEnglish.trim()) {
      toast.error("Vui lòng nhập từ tiếng Việt và tiếng Anh");
      return;
    }

    try {
      await db.vocabulary.add({
        userId: currentUser.id,
        vietnamese: newVietnamese.trim(),
        english: newEnglish.trim(),
        context: newContext.trim() || undefined,
        addedAt: new Date(),
      });

      // Reset form
      setNewVietnamese("");
      setNewEnglish("");
      setNewContext("");
      setIsAddingNew(false);
      toast.success("Đã thêm từ vựng mới");
    } catch (error) {
      toast.error("Không thể thêm từ vựng");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-gradient-to-br from-purple-50 via-white to-blue-50 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                <h2 className="text-2xl font-bold">Từ vựng của tôi</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm từ vựng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Add New Vocabulary Section */}
            <div className="p-4 border-b border-gray-200 bg-purple-50">
              {!isAddingNew ? (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                >
                  <Plus className="w-5 h-5" />
                  Thêm từ mới
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <h3 className="font-bold text-purple-700 mb-2">
                    Thêm từ vựng mới
                  </h3>
                  <input
                    type="text"
                    placeholder="Tiếng Việt *"
                    value={newVietnamese}
                    onChange={(e) => setNewVietnamese(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Tiếng Anh *"
                    value={newEnglish}
                    onChange={(e) => setNewEnglish(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <textarea
                    placeholder="Ngữ cảnh (không bắt buộc)"
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddNew}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewVietnamese("");
                        setNewEnglish("");
                        setNewContext("");
                      }}
                      className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Vocabulary List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!vocabularyList ? (
                <div className="text-center py-8 text-gray-500">
                  Đang tải...
                </div>
              ) : filteredVocabulary && filteredVocabulary.length > 0 ? (
                filteredVocabulary.map((vocab, index) => (
                  <motion.div
                    key={vocab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-2">
                          <h3 className="text-xl font-bold text-purple-700">
                            {vocab.vietnamese}
                          </h3>
                          <span className="text-gray-400">→</span>
                          <p className="text-lg text-blue-600 font-semibold">
                            {vocab.english}
                          </p>
                        </div>
                        {vocab.context && (
                          <p className="text-sm text-gray-600 italic mb-2">
                            "{vocab.context}"
                          </p>
                        )}
                        <div className="flex gap-2 text-xs">
                          {vocab.proficiencyLevel && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                              {vocab.proficiencyLevel}
                            </span>
                          )}
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                            {new Date(vocab.addedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(vocab.id)}
                        className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {searchTerm
                      ? "Không tìm thấy từ vựng nào"
                      : "Chưa có từ vựng nào. Hãy bắt đầu luyện tập!"}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Stats */}
            {vocabularyList && vocabularyList.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Tổng số từ vựng:{" "}
                    <span className="font-bold text-purple-600">
                      {vocabularyList.length}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
