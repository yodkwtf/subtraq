"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSpendSummary } from "@/hooks/useSpendSummary";
import { useStore } from "@/lib/store";
import { useEditor } from "@/components/editor-context";
import { formatCurrency } from "@/lib/utils";
import { NAV } from "./nav-config";
import { UserMenu } from "./UserMenu";

export function Header() {
  const pathname = usePathname();
  const { monthlyTotal } = useSpendSummary();
  const currency = useStore((s) => s.settings.currency);
  const { openAdd } = useEditor();

  const title = NAV.find((n) => n.href === pathname)?.label ?? "SubTraq";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-sm shadow-sm sm:flex"
          title="Total monthly spend"
        >
          <TrendingUp className="h-4 w-4 text-[hsl(var(--cyan))]" />
          <span className="text-muted-foreground">Monthly</span>
          <span className="font-semibold tabular-nums">
            {formatCurrency(monthlyTotal, currency)}
          </span>
        </motion.div>

        <ThemeToggle />

        <Button onClick={openAdd} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>

        <UserMenu />
      </div>
    </header>
  );
}
