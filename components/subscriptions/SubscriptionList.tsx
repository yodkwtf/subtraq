"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, LayoutGrid, List as ListIcon, ArrowUpDown, SlidersHorizontal, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { SubscriptionCard } from "./SubscriptionCard";
import { SlideOverPanel } from "./SlideOverPanel";
import { useFilteredSubscriptions, type SortKey, type ViewMode } from "@/hooks/useSubscriptions";
import { useStore } from "@/lib/store";
import { useEditor } from "@/components/editor-context";
import { CATEGORIES, BILLING_CYCLES, STATUSES } from "@/lib/constants";
import type { Category, Status, BillingCycle, Subscription } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SubscriptionList() {
  const reduce = useReducedMotion();
  const threshold = useStore((s) => s.settings.reminderThreshold);
  const { openAdd } = useEditor();

  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState<Category | "All">("All");
  const [status, setStatus] = React.useState<Status | "All">("All");
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle | "All">("All");
  const [sort, setSort] = React.useState<SortKey>("renewal");
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc");
  const [view, setView] = React.useState<ViewMode>("grid");

  const [selected, setSelected] = React.useState<Subscription | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(false);

  const results = useFilteredSubscriptions({
    search,
    category,
    status,
    billingCycle,
    sort,
    sortDir,
  });

  const openDetail = (sub: Subscription) => {
    setSelected(sub);
    setPanelOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="glass space-y-3 rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscriptions…"
              className="pl-9"
              aria-label="Search subscriptions"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[140px]" aria-label="Sort by">
                <ArrowUpDown className="h-4 w-4 opacity-60" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="renewal">Renewal date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              aria-label={`Sort ${sortDir === "asc" ? "descending" : "ascending"}`}
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            >
              <ArrowUpDown className={cn("h-4 w-4 transition-transform", sortDir === "desc" && "rotate-180")} />
            </Button>

            <div className="flex rounded-lg border border-border p-0.5" role="group" aria-label="View mode">
              <button
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                aria-label="Grid view"
                className={cn(
                  "rounded-md p-1.5 transition-colors focus-ring",
                  view === "grid" ? "bg-secondary text-foreground" : "text-muted-foreground"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                aria-label="List view"
                className={cn(
                  "rounded-md p-1.5 transition-colors focus-ring",
                  view === "list" ? "bg-secondary text-foreground" : "text-muted-foreground"
                )}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
          </span>
          <Combobox
            ariaLabel="Filter by category"
            value={category}
            onChange={(v) => setCategory(v as Category | "All")}
            options={["All", ...CATEGORIES]}
            placeholder="All"
            searchPlaceholder="Search categories…"
            className="h-8 w-auto gap-1.5 px-2.5 text-xs"
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as Status | "All")}
            options={STATUSES}
          />
          <FilterSelect
            label="Billing"
            value={billingCycle}
            onChange={(v) => setBillingCycle(v as BillingCycle | "All")}
            options={BILLING_CYCLES}
          />
          <span className="ml-auto text-xs text-muted-foreground">
            {results.length} result{results.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl p-12 text-center">
          <PackageOpen className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No subscriptions match your filters.</p>
          <Button onClick={openAdd} size="sm">
            Add a subscription
          </Button>
        </div>
      ) : (
        <motion.div
          key={view}
          layout={!reduce}
          className={cn(
            view === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col gap-2.5"
          )}
        >
          <AnimatePresence mode="popLayout">
            {results.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                sub={sub}
                view={view}
                threshold={threshold}
                onClick={() => openDetail(sub)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <SlideOverPanel sub={selected} open={panelOpen} onOpenChange={setPanelOpen} />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-auto gap-1.5 px-2.5 text-xs" aria-label={`Filter by ${label}`}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All">All {label}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o}>
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
