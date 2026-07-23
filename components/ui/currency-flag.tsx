import { CURRENCY_COUNTRY } from "@/lib/constants";
import type { CurrencyCode } from "@/lib/types";

interface Props {
  code: CurrencyCode | string;
  className?: string;
}

/**
 * Emoji flags (🇮🇳, 🇺🇸…) don't render on Windows because the OS font lacks the
 * regional-indicator glyphs. This renders an SVG flag instead, which looks the
 * same on every platform.
 */
export function CurrencyFlag({ code, className }: Props) {
  const country = CURRENCY_COUNTRY[code as CurrencyCode];
  if (!country) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${country}.svg`}
      alt=""
      aria-hidden
      width={20}
      height={15}
      loading="lazy"
      className={className ?? "inline-block h-[15px] w-5 rounded-[2px] object-cover"}
    />
  );
}
