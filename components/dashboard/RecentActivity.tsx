"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { Plus, Pencil, XCircle, PauseCircle, PlayCircle, Activity } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import type { ActivityType } from "@/lib/types";

const ICON: Record<ActivityType, { icon: React.ElementType; tone: string; verb: string }> = {
  added: { icon: Plus, tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", verb: "Added" },
  edited: { icon: Pencil, tone: "text-primary bg-primary/10", verb: "Edited" },
  cancelled: { icon: XCircle, tone: "text-red-600 dark:text-red-400 bg-red-500/10", verb: "Cancelled" },
  paused: { icon: PauseCircle, tone: "text-amber-600 dark:text-amber-400 bg-amber-500/10", verb: "Paused" },
  resumed: { icon: PlayCircle, tone: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10", verb: "Resumed" },
};

export function RecentActivity() {
  const activity = useStore((s) => s.activity);

  return (
    <Card className="glass flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/60 p-5">
        <Activity className="h-5 w-5 text-[hsl(var(--cyan))]" />
        <h2 className="font-semibold">Recent activity</h2>
      </div>

      {activity.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          Your changes will show up here.
        </p>
      ) : (
        <ul className="flex-1 divide-y divide-border/50 overflow-y-auto">
          {activity.slice(0, 8).map((a, i) => {
            const meta = ICON[a.type];
            const Icon = meta.icon;
            return (
              <motion.li
                key={a.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-4"
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">{meta.verb}</span>{" "}
                    <span className="text-muted-foreground">{a.subscriptionName}</span>
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground" dateTime={a.timestamp}>
                  {formatDistanceToNow(new Date(a.timestamp), { addSuffix: true })}
                </time>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
