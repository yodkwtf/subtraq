import { cn } from "@/lib/utils";

interface Props {
  size?: "sm" | "md";
  className?: string;
}

/**
 * The SubTraq logo: the gradient "S" mark plus the wordmark rendered as real
 * HTML text (not baked into an SVG). SVG text depends on the device font and can
 * overflow/clip its viewBox (e.g. the "q" got cut on iOS); native text lays out
 * with the app font and never clips. Used in landing/login/404 headers.
 */
export function Wordmark({ size = "md", className }: Props) {
  const markSize = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const textSize = size === "sm" ? "text-base" : "text-xl";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="" aria-hidden className={cn("shrink-0", markSize)} />
      <span className={cn("text-gradient font-bold tracking-tight", textSize)}>SubTraq</span>
    </span>
  );
}
