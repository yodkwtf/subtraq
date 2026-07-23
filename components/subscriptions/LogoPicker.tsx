"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { SubscriptionLogo } from "./SubscriptionLogo";
import { BRANDS, MONOGRAM_CHARS, LETTER_PREFIX, letterFromLogo } from "@/lib/brands";
import { EXTRA_BRANDS } from "@/lib/brand-extra";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type PickableBrand =
  | { kind: "brand"; slug: string; title: string; hex: string; path: string }
  | { kind: "extra"; slug: string; title: string; Icon: React.ComponentType<{ size?: number }> };

const PICKABLE: PickableBrand[] = [
  ...BRANDS.map((b) => ({ kind: "brand" as const, ...b })),
  ...EXTRA_BRANDS.map((b) => ({ kind: "extra" as const, slug: b.slug, title: b.title, Icon: b.Icon })),
].sort((a, b) => a.title.localeCompare(b.title));

interface Props {
  /** Currently selected logo value: a brand slug, "letter:X", or "" (auto) */
  value: string;
  /** Used to render the auto/monogram fallback preview */
  name: string;
  category: Category;
  onChange: (value: string) => void;
}

type Tab = "brands" | "letters";

export function LogoPicker({ value, name, category, onChange }: Props) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<Tab>("brands");
  const [query, setQuery] = React.useState("");

  const selectedLetter = letterFromLogo(value);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PICKABLE;
    return PICKABLE.filter(
      (b) => b.title.toLowerCase().includes(q) || b.slug.includes(q)
    );
  }, [query]);

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Choose an icon"
          className="rounded-lg border border-input transition-colors hover:bg-secondary focus-ring"
        >
          <SubscriptionLogo
            sub={{ name: name || "?", logo: value || undefined, category }}
            size={38}
            className="border-0"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <div className="mb-2 flex rounded-lg border border-border p-0.5" role="tablist">
          {(["brands", "letters"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors focus-ring",
                tab === t
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "brands" ? "Brands" : "A-Z 0-9"}
            </button>
          ))}
        </div>

        {tab === "brands" ? (
          <>
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 160+ brands…"
                className="h-9 pl-8 pr-8"
                aria-label="Search brand icons"
              />
              {value && (
                <button
                  type="button"
                  onClick={() => pick("")}
                  aria-label="Use automatic icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground focus-ring"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No brand matches “{query}”. Try the A-Z 0-9 tab for a letter.
              </p>
            ) : (
              <div
                role="listbox"
                aria-label="Brand icons"
                className="grid max-h-56 grid-cols-6 gap-1.5 overflow-y-auto overscroll-contain pr-1"
              >
                {results.map((b) => (
                  <button
                    key={b.slug}
                    type="button"
                    role="option"
                    aria-selected={value === b.slug}
                    title={b.title}
                    onClick={() => pick(b.slug)}
                    className={cn(
                      "flex items-center justify-center rounded-lg p-1 transition-colors hover:bg-secondary focus-ring",
                      "[content-visibility:auto] [contain-intrinsic-size:40px]",
                      value === b.slug && "bg-primary/15 ring-1 ring-primary"
                    )}
                  >
                    {b.kind === "brand" ? (
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-white"
                        aria-hidden
                      >
                        <svg viewBox="0 0 24 24" fill={`#${b.hex}`} className="h-[18px] w-[18px]">
                          <path d={b.path} />
                        </svg>
                      </span>
                    ) : (
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-foreground"
                        aria-hidden
                      >
                        <b.Icon size={18} />
                      </span>
                    )}
                    <span className="sr-only">{b.title}</span>
                  </button>
                ))}
              </div>
            )}
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {results.length} brand{results.length === 1 ? "" : "s"} · ✕ clears to automatic
            </p>
          </>
        ) : (
          <>
            <div
              role="listbox"
              aria-label="Letters and numbers"
              className="grid max-h-56 grid-cols-7 gap-1.5 overflow-y-auto pr-1"
            >
              {MONOGRAM_CHARS.map((ch) => {
                const selected = selectedLetter === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    title={ch}
                    onClick={() => pick(`${LETTER_PREFIX}${ch}`)}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors hover:bg-secondary focus-ring",
                      selected
                        ? "bg-primary/15 text-primary ring-1 ring-primary"
                        : "text-foreground"
                    )}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Pick a letter or number for a monogram icon
            </p>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
