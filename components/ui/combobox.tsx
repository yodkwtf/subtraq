"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  id?: string;
  ariaLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

/** A select with a built-in search box, for long option lists like categories. */
export function Combobox({
  value,
  onChange,
  options,
  id,
  ariaLabel,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  className,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [query, options]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background/50 px-3 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
            className
          )}
        >
          <span className={cn("line-clamp-1", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-56 p-1.5"
      >
        <div className="relative mb-1.5">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-8"
            aria-label="Search options"
          />
        </div>
        <div role="listbox" className="max-h-56 overflow-y-auto overscroll-contain">
          {results.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No matches</p>
          ) : (
            results.map((o) => (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={value === o}
                onClick={() => {
                  onChange(o);
                  handleOpenChange(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary focus-ring",
                  value === o && "bg-secondary"
                )}
              >
                <span>{o}</span>
                {value === o && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
