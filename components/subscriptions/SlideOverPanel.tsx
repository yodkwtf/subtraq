"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Pause,
  Play,
  CalendarClock,
  CalendarPlus,
  Repeat,
  StickyNote,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CategoryBadge, StatusBadge } from "./badges";
import { SubscriptionLogo } from "./SubscriptionLogo";
import type { Subscription } from "@/lib/types";
import { billingPeriod, daysUntil, toAnnual, toMonthly, urgencyLabel } from "@/lib/utils";
import { useDisplayCurrency } from "@/hooks/useDisplayCurrency";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useEditor } from "@/components/editor-context";
import { useToast } from "@/components/ui/toast";

interface Props {
  sub: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3">
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="ml-auto text-sm font-medium">{value}</span>
    </div>
  );
}

export function SlideOverPanel({ sub, open, onOpenChange }: Props) {
  const { deleteSubscription, setStatus } = useSubscriptions();
  const { openEdit } = useEditor();
  const { toast } = useToast();
  const { formatDisplay } = useDisplayCurrency();

  if (!sub) return null;

  const days = daysUntil(sub.nextRenewalDate);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-describedby="slideover-desc">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SubscriptionLogo sub={sub} size={56} />
            <div className="min-w-0">
              <SheetTitle className="truncate">{sub.name}</SheetTitle>
              <SheetDescription id="slideover-desc" className="flex items-center gap-2 pt-1">
                <CategoryBadge category={sub.category} />
                <StatusBadge status={sub.status} />
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex items-baseline gap-2 rounded-xl bg-gradient-to-br from-primary/10 to-transparent p-4">
          <span className="text-3xl font-bold tabular-nums">
            {formatDisplay(sub.amount, sub.currency)}
          </span>
          <span className="text-sm text-muted-foreground">/ {billingPeriod(sub.billingCycle)}</span>
          <span className="ml-auto text-right text-xs text-muted-foreground">
            ≈ {formatDisplay(toMonthly(sub.amount, sub.billingCycle), sub.currency)}/mo
            <br />≈ {formatDisplay(toAnnual(sub.amount, sub.billingCycle), sub.currency)}/yr
          </span>
        </div>

        <div className="space-y-2.5 overflow-y-auto">
          <DetailRow
            icon={CalendarClock}
            label="Next renewal"
            value={
              <span>
                {format(new Date(sub.nextRenewalDate), "MMM d, yyyy")}
                {sub.status === "Active" && (
                  <span className="ml-1 text-muted-foreground">({urgencyLabel(days)})</span>
                )}
              </span>
            }
          />
          <DetailRow
            icon={CalendarPlus}
            label="Started"
            value={format(new Date(sub.startDate), "MMM d, yyyy")}
          />
          <DetailRow icon={Repeat} label="Billing" value={sub.billingCycle} />
          {sub.notes && (
            <div className="flex gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3">
              <StickyNote className="h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-sm">{sub.notes}</p>
            </div>
          )}
          {sub.url && (
            <a
              href={sub.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/30 p-3 text-sm font-medium text-primary transition-colors hover:bg-secondary/60 focus-ring"
            >
              <ExternalLink className="h-4 w-4" />
              Manage subscription
            </a>
          )}
        </div>

        <div className="mt-auto space-y-2 border-t border-border/60 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
                openEdit(sub);
              }}
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            {sub.status === "Paused" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setStatus(sub.id, "Active");
                  toast({ title: "Resumed", description: sub.name });
                }}
              >
                <Play className="h-4 w-4" /> Resume
              </Button>
            ) : sub.status === "Active" ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setStatus(sub.id, "Paused");
                  toast({ title: "Paused", description: sub.name, variant: "info" });
                }}
              >
                <Pause className="h-4 w-4" /> Pause
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => {
                  setStatus(sub.id, "Active");
                  toast({ title: "Reactivated", description: sub.name });
                }}
              >
                <Play className="h-4 w-4" /> Reactivate
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              const name = sub.name;
              deleteSubscription(sub.id);
              onOpenChange(false);
              toast({ title: "Subscription deleted", description: name, variant: "info" });
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete permanently
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
