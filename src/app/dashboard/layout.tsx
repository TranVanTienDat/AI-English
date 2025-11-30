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
    <div className="min-h-screen bg-muted/30 dark:bg-background">
      <Toaster richColors />
      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <header className="bg-card dark:bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl text-primary">TOEIC Writing AI</div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer"
              onClick={() => setIsSettingsOpen(true)}
            >
              <UserIcon size={16} className="text-primary" />
              <span>{currentUser?.name}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut
                size={18}
                className="text-primary hover:text-destructive"
              />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
