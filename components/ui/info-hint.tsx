"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  /** Text revealed on hover/focus of the info icon. */
  label: string;
  /** Which edge the tooltip is anchored to (so it extends into view). */
  align?: "left" | "right";
  className?: string;
}

/**
 * A small info icon that reveals a tooltip on hover or keyboard focus. Used to
 * explain non-obvious form fields without cluttering the layout. No external
 * dependency — pure CSS hover/focus, so it works inside dialogs and popovers.
 */
export function InfoHint({ label, align = "left", className }: Props) {
  return (
    <span className={cn("group/hint relative inline-flex align-middle", className)}>
      <button
        type="button"
        aria-label={label}
        className="inline-flex rounded text-muted-foreground/70 transition-colors hover:text-foreground focus-ring"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-full z-50 mt-1.5 w-56 rounded-lg border border-border",
          align === "right" ? "right-0" : "left-0",
          "bg-popover px-3 py-2 text-xs font-normal leading-snug text-popover-foreground shadow-xl",
          "opacity-0 transition-opacity duration-150",
          "group-hover/hint:opacity-100 group-focus-within/hint:opacity-100"
        )}
      >
        {label}
      </span>
    </span>
  );
}
