"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { LoginView } from "@/components/LoginView";

export default function Home() {
  const router = useRouter();
  const currentUser = useStore((state) => state.currentUser);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && currentUser) {
      router.push("/dashboard");
    }
  }, [isHydrated, currentUser, router]);

  if (!isHydrated) return null; // Or a loading spinner

  if (currentUser) return null; // Will redirect

  return <LoginView />;
}
