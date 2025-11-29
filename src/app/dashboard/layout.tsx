"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon } from "lucide-react";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = () => {
    setCurrentUser(null);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Toaster richColors />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-blue-600 dark:text-blue-400">
            TOEIC Writing AI
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              onClick={() => setIsSettingsOpen(true)}
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300">
                <UserIcon size={16} />
              </div>
              <span>{currentUser?.name}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={18} className="text-slate-500 hover:text-red-500" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
