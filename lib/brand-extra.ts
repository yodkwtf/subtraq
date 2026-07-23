import type { IconType } from "react-icons";
import { FaAmazon, FaMicrosoft, FaXbox } from "react-icons/fa6";
import { TbBrandAmazon, TbBrandOffice } from "react-icons/tb";
import { MdOndemandVideo, MdLibraryMusic } from "react-icons/md";
import { SiCanva } from "react-icons/si";

/**
 * Brands Simple Icons no longer ships (mostly trademark removals) render as
 * uncolored (currentColor) marks from react-icons. Where a vendor's sub-brands
 * have no dedicated logo (Prime Video, Amazon Music…), a distinct, themed icon
 * is used so they never collapse into the same mark.
 */
export interface ExtraBrand {
  slug: string;
  title: string;
  Icon: IconType;
}

export const EXTRA_BRANDS: ExtraBrand[] = [
  { slug: "amazon", title: "Amazon", Icon: FaAmazon },
  { slug: "amazonprime", title: "Amazon Prime", Icon: TbBrandAmazon },
  { slug: "primevideo", title: "Prime Video", Icon: MdOndemandVideo },
  { slug: "amazonmusic", title: "Amazon Music", Icon: MdLibraryMusic },
  { slug: "microsoft", title: "Microsoft", Icon: FaMicrosoft },
  { slug: "microsoft365", title: "Microsoft 365", Icon: TbBrandOffice },
  { slug: "xbox", title: "Xbox", Icon: FaXbox },
  { slug: "canva", title: "Canva", Icon: SiCanva },
];

export const EXTRA_BRAND_MAP: Record<string, ExtraBrand> = Object.fromEntries(
  EXTRA_BRANDS.map((b) => [b.slug, b])
);

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Free-text names that should resolve to a specific sub-brand slug. */
const ALIASES: Record<string, string> = {
  amazonprimevideo: "primevideo",
  amazonvideo: "primevideo",
  primevideo: "primevideo",
  amazonprimemusic: "amazonmusic",
  amazonmusic: "amazonmusic",
  amazonprime: "amazonprime",
  office365: "microsoft365",
  microsoftoffice: "microsoft365",
  ms365: "microsoft365",
  microsoft365: "microsoft365",
};

const EXTRA_BY_TITLE: Record<string, string> = Object.fromEntries(
  EXTRA_BRANDS.map((b) => [norm(b.title), b.slug])
);

export function detectExtraBrandSlug(name: string): string | null {
  if (!name) return null;
  const whole = norm(name);
  if (ALIASES[whole]) return ALIASES[whole];
  if (EXTRA_BY_TITLE[whole]) return EXTRA_BY_TITLE[whole];
  const first = norm(name.split(/\s+/)[0] ?? "");
  if (first.length >= 2 && EXTRA_BY_TITLE[first]) return EXTRA_BY_TITLE[first];
  return null;
}
