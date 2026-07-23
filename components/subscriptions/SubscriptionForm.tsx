"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { LogoPicker } from "./LogoPicker";
import { CurrencyFlag } from "@/components/ui/currency-flag";
import { Combobox } from "@/components/ui/combobox";
import { InfoHint } from "@/components/ui/info-hint";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES, BILLING_CYCLES, STATUSES, CURRENCIES } from "@/lib/constants";
import type { Subscription, Category, Status, BillingCycle } from "@/lib/types";
import { currencySymbol, renewalFromCycle, todayISO } from "@/lib/utils";

export type SubscriptionDraft = Omit<Subscription, "id">;

interface Props {
  initial?: Subscription;
  defaultCurrency?: string;
  onSubmit: (draft: SubscriptionDraft) => void;
  onCancel?: () => void;
  formId?: string;
}

export function SubscriptionForm({
  initial,
  defaultCurrency = "INR",
  onSubmit,
  onCancel,
  formId = "subscription-form",
}: Props) {
  const [values, setValues] = React.useState<SubscriptionDraft>(() => {
    const startDate = initial?.startDate ?? todayISO();
    const billingCycle = initial?.billingCycle ?? "Monthly";
    return {
      name: initial?.name ?? "",
      logo: initial?.logo ?? "",
      category: initial?.category ?? "SaaS",
      amount: initial?.amount ?? 0,
      currency: initial?.currency ?? defaultCurrency,
      billingCycle,
      nextRenewalDate: initial?.nextRenewalDate ?? renewalFromCycle(startDate, billingCycle),
      startDate,
      notes: initial?.notes ?? "",
      status: initial?.status ?? "Active",
      url: initial?.url ?? "",
    };
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = React.useState(false);
  const { toast } = useToast();

  function set<K extends keyof SubscriptionDraft>(key: K, value: SubscriptionDraft[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  // Ask the AI route to guess the category + billing cycle from the name, and
  // keep the renewal date in step with the suggested cycle.
  async function autofillWithAi() {
    const name = values.name.trim();
    if (!name) {
      toast({
        title: "Add a name first",
        description: "Type the service name, then let AI fill in the rest.",
        variant: "info",
      });
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      const cycle = (data.billingCycle as BillingCycle) ?? values.billingCycle;
      setValues((v) => ({
        ...v,
        category: (data.category as Category) ?? v.category,
        billingCycle: cycle,
        nextRenewalDate: renewalFromCycle(v.startDate, cycle),
      }));
      toast({
        title: "AI auto-fill applied",
        description: `${data.category} · ${data.billingCycle}`,
      });
    } catch (err) {
      toast({
        title: "Couldn't auto-fill",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "error",
      });
    } finally {
      setAiLoading(false);
    }
  }

  // Keep the renewal date in step with the start date + billing cycle so
  // switching to Quarterly/Annually moves the renewal accordingly.
  function setBillingCycle(cycle: BillingCycle) {
    setValues((v) => ({
      ...v,
      billingCycle: cycle,
      nextRenewalDate: renewalFromCycle(v.startDate, cycle),
    }));
  }

  function setStartDate(startDate: string) {
    setValues((v) => ({
      ...v,
      startDate,
      nextRenewalDate: renewalFromCycle(startDate, v.billingCycle),
    }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = "Name is required.";
    if (!(values.amount > 0)) next.amount = "Enter an amount greater than 0.";
    if (!values.nextRenewalDate) next.nextRenewalDate = "Renewal date is required.";
    else if (values.startDate && values.nextRenewalDate < values.startDate)
      next.nextRenewalDate = "Renewal date can't be before the start date.";
    if (!values.startDate) next.startDate = "Start date is required.";
    else if (values.startDate > todayISO())
      next.startDate = "Start date can't be in the future.";
    if (values.url && !/^https?:\/\//i.test(values.url))
      next.url = "URL must start with http:// or https://";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...values,
      name: values.name.trim(),
      logo: values.logo?.trim() || undefined,
      url: values.url?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
    });
  }

  const fieldErr = (id: string) =>
    errors[id] ? (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        id={`${id}-error`}
        role="alert"
        className="text-xs text-destructive"
      >
        {errors[id]}
      </motion.p>
    ) : null;

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name & icon</Label>
        <div className="flex gap-2">
          <LogoPicker
            value={values.logo ?? ""}
            name={values.name}
            category={values.category as Category}
            onChange={(slug) => set("logo", slug)}
          />
          <Input
            id="name"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Netflix"
            aria-required="true"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            autoFocus
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Pick an icon, or search a brand name to find one.
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1.5 px-2 text-xs text-primary hover:text-primary"
            onClick={autofillWithAi}
            disabled={aiLoading || !values.name.trim()}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {aiLoading ? "Thinking…" : "AI auto-fill"}
          </Button>
        </div>
        {fieldErr("name")}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <Combobox
            id="category"
            ariaLabel="Category"
            value={values.category}
            onChange={(v) => set("category", v as Category)}
            options={CATEGORIES}
            searchPlaceholder="Search categories…"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select value={values.status} onValueChange={(v) => set("status", v as Status)}>
            <SelectTrigger id="status" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {currencySymbol(values.currency)}
            </span>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              className="pl-7"
              value={values.amount || ""}
              onChange={(e) => set("amount", parseFloat(e.target.value) || 0)}
              aria-required="true"
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? "amount-error" : undefined}
            />
          </div>
          {fieldErr("amount")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">Currency</Label>
          <Select value={values.currency} onValueChange={(v) => set("currency", v)}>
            <SelectTrigger id="currency" aria-label="Currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="flex items-center gap-2">
                    <CurrencyFlag code={c.code} />
                    {c.symbol} {c.code}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="billingCycle">Billing cycle</Label>
        <Select
          value={values.billingCycle}
          onValueChange={(v) => setBillingCycle(v as BillingCycle)}
        >
          <SelectTrigger id="billingCycle" aria-label="Billing cycle">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BILLING_CYCLES.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <InfoHint label="When you first subscribed. This is fixed history that sets how long you've had the subscription and anchors the billing schedule." />
          </div>
          <Input
            id="startDate"
            type="date"
            max={todayISO()}
            value={values.startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-invalid={!!errors.startDate}
            aria-describedby={errors.startDate ? "startDate-error" : undefined}
          />
          {fieldErr("startDate")}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="nextRenewalDate">Next renewal</Label>
            <InfoHint
              align="right"
              label="Your next charge. Auto-filled from the start date and billing cycle, and it rolls forward each cycle on its own - only change it if your real billing day differs."
            />
          </div>
          <Input
            id="nextRenewalDate"
            type="date"
            min={values.startDate || undefined}
            value={values.nextRenewalDate}
            onChange={(e) => set("nextRenewalDate", e.target.value)}
            aria-invalid={!!errors.nextRenewalDate}
            aria-describedby={
              errors.nextRenewalDate ? "nextRenewalDate-error" : undefined
            }
          />
          {fieldErr("nextRenewalDate")}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="url">Manage URL (optional)</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://..."
          value={values.url}
          onChange={(e) => set("url", e.target.value)}
          aria-invalid={!!errors.url}
          aria-describedby={errors.url ? "url-error" : undefined}
        />
        {fieldErr("url")}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          rows={2}
          placeholder="Anything worth remembering…"
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">{initial ? "Save changes" : "Add subscription"}</Button>
      </div>
    </form>
  );
}
