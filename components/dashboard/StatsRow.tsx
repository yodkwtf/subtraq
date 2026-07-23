"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Wallet, CalendarClock, LayoutGrid, Timer } from "lucide-react";
import { useSpendSummary } from "@/hooks/useSpendSummary";
import { useStore } from "@/lib/store";
import { formatCurrency, urgencyLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

interface Stat {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}

export function StatsRow() {
  const summary = useSpendSummary();
  const currency = useStore((s) => s.settings.currency);

  const stats: Stat[] = [
    {
      label: "Monthly spend",
      value: formatCurrency(summary.monthlyTotal, currency),
      sub: "across active subscriptions",
      icon: Wallet,
      accent: "from-primary/20 to-primary/5 text-primary",
    },
    {
      label: "Annual spend",
      value: formatCurrency(summary.annualTotal, currency),
      sub: "projected per year",
      icon: CalendarClock,
      accent: "from-[hsl(var(--cyan))]/20 to-[hsl(var(--cyan))]/5 text-[hsl(var(--cyan))]",
    },
    {
      label: "Active subs",
      value: String(summary.activeCount),
      sub: `${summary.pausedCount} paused`,
      icon: LayoutGrid,
      accent: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Next renewal",
      value: summary.nextRenewal ? summary.nextRenewal.sub.name : "None",
      sub: summary.nextRenewal ? urgencyLabel(summary.nextRenewal.days) : "Nothing upcoming",
      icon: Timer,
      accent: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            variants={item}
            whileHover={{ y: -4 }}
            className="glass group relative overflow-hidden rounded-2xl p-4 sm:p-5"
          >
            <div
              className={cn(
                "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                s.accent
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
              {s.value}
            </p>
            {s.sub && <p className="mt-0.5 truncate text-xs text-muted-foreground">{s.sub}</p>}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
