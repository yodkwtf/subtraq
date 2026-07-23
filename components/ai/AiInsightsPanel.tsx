"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, TrendingDown, AlertCircle, Wand2, Send } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, cn } from "@/lib/utils";
import type { AiSuggestion } from "@/lib/types";

type State = "idle" | "loading" | "done" | "error";

export function AiInsightsPanel() {
  const subscriptions = useStore((s) => s.subscriptions);
  const currency = useStore((s) => s.settings.currency);
  const archive = useStore((s) => s.archiveSubscription);

  const [state, setState] = React.useState<State>("idle");
  const [suggestions, setSuggestions] = React.useState<AiSuggestion[]>([]);
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());
  const [error, setError] = React.useState<string>("");

  const [question, setQuestion] = React.useState("");
  const [askState, setAskState] = React.useState<State>("idle");
  const [answer, setAnswer] = React.useState("");
  const [askError, setAskError] = React.useState("");

  const activeForAi = () =>
    subscriptions
      .filter((s) => s.status !== "Cancelled")
      .map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        amount: s.amount,
        currency: s.currency,
        billingCycle: s.billingCycle,
        status: s.status,
      }));

  const ask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = question.trim();
    if (!q) return;
    setAskState("loading");
    setAskError("");
    setAnswer("");
    try {
      const res = await fetch("/api/ai-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, subscriptions: activeForAi() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setAnswer(typeof data.answer === "string" ? data.answer : "");
      setAskState("done");
    } catch (err) {
      setAskError(err instanceof Error ? err.message : "Something went wrong.");
      setAskState("error");
    }
  };

  const analyze = async () => {
    setState("loading");
    setError("");
    setDismissed(new Set());
    try {
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptions: subscriptions
            .filter((s) => s.status !== "Cancelled")
            .map((s) => ({
              id: s.id,
              name: s.name,
              category: s.category,
              amount: s.amount,
              billingCycle: s.billingCycle,
              status: s.status,
            })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setState("error");
    }
  };

  const visible = suggestions.filter((s) => !dismissed.has(s.id));
  const totalSaving = visible.reduce((sum, s) => sum + (s.potentialSaving || 0), 0);

  return (
    <Card className="glass relative overflow-hidden">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--cyan))] text-white shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold">AI Insights</h2>
            <p className="text-xs text-muted-foreground">
              Spot subscriptions worth cancelling.
            </p>
          </div>
        </div>
        <Button onClick={analyze} disabled={state === "loading"} className="gap-2">
          <Wand2 className="h-4 w-4" />
          {state === "loading" ? "Thinking…" : "Analyse my subscriptions"}
        </Button>
      </div>

      <div className="relative px-5 pb-5">
        <AnimatePresence mode="wait">
          {state === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                >
                  Analysing your {subscriptions.length} subscriptions…
                </motion.span>
              </div>
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Couldn&apos;t analyse</p>
                <p className="text-muted-foreground">{error}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Make sure <code className="rounded bg-muted px-1">GEMINI_API_KEY</code> is
                  set in <code className="rounded bg-muted px-1">.env.local</code>.
                </p>
              </div>
            </motion.div>
          )}

          {state === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-3"
            >
              {visible.length === 0 ? (
                <p className="rounded-xl border border-border/60 bg-secondary/30 p-4 text-sm text-muted-foreground">
                  🎉 No cuts suggested. Your stack looks lean.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-emerald-400" />
                    <span className="text-muted-foreground">Potential savings:</span>
                    <span className="font-semibold text-emerald-400">
                      {formatCurrency(totalSaving, currency)}/yr
                    </span>
                  </div>
                  <ul className="space-y-3">
                    <AnimatePresence>
                      {visible.map((s) => (
                        <motion.li
                          key={s.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          className="group relative rounded-xl border border-border/60 bg-secondary/30 p-4"
                        >
                          <button
                            onClick={() =>
                              setDismissed((d) => new Set(d).add(s.id))
                            }
                            aria-label={`Dismiss suggestion for ${s.name}`}
                            className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground opacity-60 transition-opacity hover:opacity-100 focus-ring"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="flex items-center gap-2 pr-8">
                            <span className="font-medium">{s.name}</span>
                            {s.potentialSaving > 0 && (
                              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                                save {formatCurrency(s.potentialSaving, currency)}/yr
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{s.reason}</p>
                          <div className="mt-3 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                archive(s.id);
                                setDismissed((d) => new Set(d).add(s.id));
                              }}
                            >
                              Cancel it
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDismissed((d) => new Set(d).add(s.id))}
                            >
                              Keep
                            </Button>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </>
              )}
            </motion.div>
          )}

          {state === "idle" && (
            <motion.p
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground"
            >
              Click <span className="font-medium text-foreground">Analyse</span> and AI will
              review your subscriptions for overlap, high cost, and low likely usage.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-4 border-t border-border/60 pt-4">
          <form onSubmit={ask} className="flex items-center gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything, e.g. which plan costs me most per year?"
              aria-label="Ask AI about your subscriptions"
            />
            <Button
              type="submit"
              size="icon"
              variant="outline"
              disabled={askState === "loading" || !question.trim()}
              aria-label="Ask"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {askState === "loading" && (
            <p className="mt-2 text-sm text-muted-foreground">Thinking…</p>
          )}
          {askState === "error" && (
            <p className="mt-2 text-sm text-destructive">{askError}</p>
          )}
          {askState === "done" && answer && (
            <p className="mt-3 whitespace-pre-wrap rounded-xl border border-border/60 bg-secondary/30 p-3 text-sm">
              {answer}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
