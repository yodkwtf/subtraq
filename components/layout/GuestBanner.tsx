"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";

export function GuestBanner() {
  const { isGuest } = useAuth();
  if (!isGuest) return null;

  return (
    <div className="flex items-center justify-center gap-2 border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-800 dark:text-amber-200">
      <Info className="h-3.5 w-3.5 shrink-0" />
      <span>
        You&apos;re exploring as a guest with sample data.{" "}
        <Link href="/login?mode=signup" className="font-medium underline">
          Create an account
        </Link>{" "}
        to save and sync across devices.
      </span>
    </div>
  );
}
