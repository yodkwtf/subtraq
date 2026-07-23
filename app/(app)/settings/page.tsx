"use client";

import * as React from "react";
import {
  Download,
  Upload,
  Trash2,
  Coins,
  BellRing,
  AlertTriangle,
  Sparkles,
  UserRound,
  LogIn,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CurrencyFlag } from "@/components/ui/currency-flag";
import { useStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth/auth-context";
import { CURRENCIES, REMINDER_THRESHOLDS } from "@/lib/constants";
import type { CurrencyCode, Subscription } from "@/lib/types";

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const subscriptions = useStore((s) => s.subscriptions);
  const importData = useStore((s) => s.importData);
  const loadSampleData = useStore((s) => s.loadSampleData);
  const clearAll = useStore((s) => s.clearAll);
  const setSampleDismissed = useStore((s) => s.setSampleDismissed);

  const { toast } = useToast();
  const { isAuthed, isGuest, user, signOut } = useAuth();
  const router = useRouter();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState(settings.name ?? "");

  React.useEffect(() => setNameDraft(settings.name ?? ""), [settings.name]);

  const handleCurrencyChange = (code: CurrencyCode) => {
    updateSettings({ currency: code });
    const label = CURRENCIES.find((c) => c.code === code)?.label ?? code;
    toast({ title: "Currency updated", description: `Now showing amounts in ${label}.` });
  };

  const handleThresholdChange = (value: 3 | 7 | 14) => {
    updateSettings({ reminderThreshold: value });
    toast({
      title: "Reminder updated",
      description: `You'll be reminded ${value} days before renewals.`,
    });
  };

  const handleNotifyChange = async (on: boolean) => {
    if (on) {
      if (typeof window === "undefined" || !("Notification" in window)) {
        toast({
          title: "Not supported",
          description: "This browser can't show notifications.",
          variant: "error",
        });
        return;
      }
      if (Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") {
          toast({
            title: "Notifications blocked",
            description: "Allow notifications in your browser to get renewal reminders.",
            variant: "error",
          });
          return;
        }
      }
    }
    updateSettings({ notifyRenewals: on });
    toast({
      title: on ? "Reminders on" : "Reminders off",
      description: on
        ? "We'll notify you before renewals while the app is open."
        : "Renewal notifications are disabled.",
    });
  };

  const handleSaveName = () => {
    updateSettings({ name: nameDraft.trim() || undefined });
    toast({ title: "Profile saved", description: "Your display name was updated." });
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  const handleExport = () => {
    const payload = JSON.stringify({ subscriptions, settings }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subtraq-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Data exported",
      description: `${subscriptions.length} subscription${subscriptions.length === 1 ? "" : "s"} saved to JSON.`,
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const subs: Subscription[] = Array.isArray(data.subscriptions)
          ? data.subscriptions
          : Array.isArray(data)
            ? data
            : [];
        if (subs.length === 0) throw new Error("No subscriptions found in file.");
        importData({ subscriptions: subs, settings: data.settings });
        toast({
          title: "Data imported",
          description: `${subs.length} subscription${subs.length === 1 ? "" : "s"} loaded.`,
        });
      } catch (err) {
        toast({
          title: "Import failed",
          description: err instanceof Error ? err.message : "Invalid JSON file.",
          variant: "error",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleRestore = () => {
    loadSampleData();
    // Loading the sample data again brings its banner back for this user.
    if (user?.id) setSampleDismissed(user.id, false);
    toast({
      title: "Sample data restored",
      description: "8 example subscriptions are back.",
    });
  };

  const handleClearAll = () => {
    clearAll();
    setConfirmOpen(false);
    toast({
      title: "All data cleared",
      description: "Your subscriptions and activity were removed.",
      variant: "info",
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-sm text-muted-foreground">
        {isAuthed
          ? "Manage your profile, preferences, and data. Changes sync to your account."
          : "Preferences and your data. Everything is stored on this device."}
      </p>

      <Card className="glass p-5">
        <div className="mb-4 flex items-center gap-2">
          <UserRound className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">Profile</h2>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="display-name">Display name</Label>
            <div className="flex gap-2">
              <Input
                id="display-name"
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                placeholder="Your name"
              />
              <Button
                onClick={handleSaveName}
                disabled={nameDraft.trim() === (settings.name ?? "")}
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Used for the greeting and menu. {isGuest ? "Saved on this device." : null}
            </p>
          </div>

          {isGuest ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-border/60 bg-secondary/30 p-4">
              <p className="text-sm text-muted-foreground">
                You&apos;re browsing as a guest, so your name and data stay on this device.
                Create an account to sync everything across devices.
              </p>
              <Link href="/login?mode=signup">
                <Button variant="secondary" className="gap-2">
                  <LogIn className="h-4 w-4" /> Sign in / Sign up
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {user?.email && (
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={user.email} disabled readOnly />
                </div>
              )}
              {user?.created_at && (
                <div className="space-y-1.5">
                  <Label>Member since</Label>
                  <Input
                    value={format(new Date(user.created_at), "d MMMM yyyy")}
                    disabled
                    readOnly
                  />
                </div>
              )}
              <div className="pt-1">
                <Button variant="outline" className="gap-2" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card className="glass p-5">
        <h2 className="mb-4 font-semibold">Preferences</h2>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="currency" className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              Default currency
            </Label>
            <Select
              value={settings.currency}
              onValueChange={(v) => handleCurrencyChange(v as CurrencyCode)}
            >
              <SelectTrigger id="currency" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <CurrencyFlag code={c.code} />
                      <span>
                        {c.symbol} {c.code} - {c.label}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="threshold" className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-muted-foreground" />
              Reminder threshold
            </Label>
            <Select
              value={String(settings.reminderThreshold)}
              onValueChange={(v) => handleThresholdChange(Number(v) as 3 | 7 | 14)}
            >
              <SelectTrigger id="threshold" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REMINDER_THRESHOLDS.map((t) => (
                  <SelectItem key={t} value={String(t)}>
                    {t} days before
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="notify" className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-muted-foreground" />
                Renewal reminders
              </Label>
              <p className="text-xs text-muted-foreground">
                Browser notifications for renewals within your threshold (while the app is open).
              </p>
            </div>
            <Switch
              id="notify"
              checked={!!settings.notifyRenewals}
              onCheckedChange={handleNotifyChange}
              aria-label="Toggle renewal reminders"
            />
          </div>
        </div>
      </Card>

      <Card className="glass p-5">
        <h2 className="mb-1 font-semibold">Your data</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {subscriptions.length} subscription{subscriptions.length === 1 ? "" : "s"} stored.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export JSON
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import JSON
          </Button>
          <Button variant="outline" onClick={handleRestore}>
            <Sparkles className="h-4 w-4" /> Restore sample data
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
            className="hidden"
            aria-hidden
          />
        </div>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="font-semibold">Danger zone</h2>
        </div>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Permanently delete all subscriptions and activity. This cannot be undone.
        </p>
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-4 w-4" /> Clear all data
        </Button>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent aria-labelledby="clear-title" aria-describedby="clear-desc">
          <DialogHeader>
            <DialogTitle id="clear-title">Clear all data?</DialogTitle>
            <DialogDescription id="clear-desc">
              This will permanently remove all {subscriptions.length} subscriptions and your
              activity history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleClearAll}>
              Yes, delete everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
