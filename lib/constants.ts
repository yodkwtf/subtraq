import type { Category, BillingCycle, Status, CurrencyCode, Subscription } from "./types";
import { nextRenewalOnOrAfter } from "./dates";

export const CATEGORIES: Category[] = [
  "Streaming",
  "Music",
  "Gaming",
  "SaaS",
  "AI Tools",
  "Developer Tools",
  "Productivity",
  "Design",
  "Cloud",
  "Storage",
  "Domain",
  "Security",
  "Education",
  "Health & Fitness",
  "News",
  "Finance",
  "Shopping",
  "Food",
  "Social",
  "Utilities",
  "Other",
];

export const BILLING_CYCLES: BillingCycle[] = ["Monthly", "Quarterly", "Annually"];

export const STATUSES: Status[] = ["Active", "Paused", "Cancelled"];

export const CURRENCIES: {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  /** ISO 3166-1 alpha-2 code, used for SVG flags that render on every OS. */
  country: string;
}[] = [
  { code: "INR", symbol: "₹", label: "Indian Rupee", flag: "🇮🇳", country: "in" },
  { code: "USD", symbol: "$", label: "US Dollar", flag: "🇺🇸", country: "us" },
  { code: "EUR", symbol: "€", label: "Euro", flag: "🇪🇺", country: "eu" },
  { code: "GBP", symbol: "£", label: "British Pound", flag: "🇬🇧", country: "gb" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen", flag: "🇯🇵", country: "jp" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar", flag: "🇦🇺", country: "au" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar", flag: "🇨🇦", country: "ca" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar", flag: "🇸🇬", country: "sg" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham", flag: "🇦🇪", country: "ae" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan", flag: "🇨🇳", country: "cn" },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc", flag: "🇨🇭", country: "ch" },
  { code: "BRL", symbol: "R$", label: "Brazilian Real", flag: "🇧🇷", country: "br" },
  { code: "ZAR", symbol: "R", label: "South African Rand", flag: "🇿🇦", country: "za" },
  { code: "NZD", symbol: "NZ$", label: "New Zealand Dollar", flag: "🇳🇿", country: "nz" },
];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.symbol])
) as Record<CurrencyCode, string>;

export const CURRENCY_FLAGS: Record<CurrencyCode, string> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.flag])
) as Record<CurrencyCode, string>;

export const CURRENCY_COUNTRY: Record<CurrencyCode, string> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c.country])
) as Record<CurrencyCode, string>;

export const DEFAULT_CURRENCY: CurrencyCode = "INR";

export const REMINDER_THRESHOLDS: (3 | 7 | 14)[] = [3, 7, 14];

export const CATEGORY_COLORS: Record<Category, string> = {
  Streaming: "#6366F1",
  Music: "#F472B6",
  Gaming: "#8B5CF6",
  SaaS: "#22D3EE",
  "AI Tools": "#14B8A6",
  "Developer Tools": "#A78BFA",
  Productivity: "#0EA5E9",
  Design: "#EC4899",
  Cloud: "#34D399",
  Storage: "#10B981",
  Domain: "#F59E0B",
  Security: "#EF4444",
  Education: "#FB923C",
  "Health & Fitness": "#4ADE80",
  News: "#94A3B8",
  Finance: "#FBBF24",
  Shopping: "#F87171",
  Food: "#FB7185",
  Social: "#38BDF8",
  Utilities: "#64748B",
  Other: "#9CA3AF",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  Streaming: "🎬",
  Music: "🎧",
  Gaming: "🎮",
  SaaS: "🧩",
  "AI Tools": "🤖",
  "Developer Tools": "🛠️",
  Productivity: "✅",
  Design: "🎨",
  Cloud: "☁️",
  Storage: "🗄️",
  Domain: "🌐",
  Security: "🔐",
  Education: "📚",
  "Health & Fitness": "💪",
  News: "📰",
  Finance: "💳",
  Shopping: "🛍️",
  Food: "🍔",
  Social: "💬",
  Utilities: "⚙️",
  Other: "📦",
};

// Renewal dates are derived from each start date + billing cycle at load time so
// the sample data never drifts into the past or out of sync with its cycle.
const SEED_SOURCE: Omit<Subscription, "nextRenewalDate">[] = [
  {
    id: "1",
    name: "Netflix",
    logo: "netflix",
    category: "Streaming",
    amount: 649,
    currency: "INR",
    billingCycle: "Monthly",
    startDate: "2023-01-26",
    status: "Active",
    url: "https://netflix.com/account",
    notes: "Premium 4K plan.",
  },
  {
    id: "2",
    name: "Amazon Prime",
    logo: "amazonprime",
    category: "Shopping",
    amount: 1499,
    currency: "INR",
    billingCycle: "Annually",
    startDate: "2021-08-10",
    status: "Active",
    url: "https://amazon.in/prime",
  },
  {
    id: "3",
    name: "Spotify",
    logo: "spotify",
    category: "Music",
    amount: 119,
    currency: "INR",
    billingCycle: "Monthly",
    startDate: "2020-05-30",
    status: "Active",
    url: "https://spotify.com/account",
  },
  {
    id: "4",
    name: "YouTube Premium",
    logo: "youtube",
    category: "Streaming",
    amount: 149,
    currency: "INR",
    billingCycle: "Monthly",
    startDate: "2022-11-08",
    status: "Active",
    url: "https://youtube.com/paid_memberships",
  },
  {
    id: "5",
    name: "iCloud+",
    logo: "icloud",
    category: "Storage",
    amount: 75,
    currency: "INR",
    billingCycle: "Monthly",
    startDate: "2024-06-15",
    status: "Active",
    notes: "50 GB plan.",
  },
  {
    id: "6",
    name: "Apple TV+",
    logo: "appletv",
    category: "Streaming",
    amount: 99,
    currency: "INR",
    billingCycle: "Monthly",
    startDate: "2023-09-20",
    status: "Paused",
  },
];

export const SEED_SUBSCRIPTIONS: Subscription[] = SEED_SOURCE.map((s) => ({
  ...s,
  nextRenewalDate: nextRenewalOnOrAfter(s.startDate, s.billingCycle),
}));

/** Ids of the sample subscriptions, used to detect an untouched sample dataset. */
export const SEED_IDS = new Set(SEED_SUBSCRIPTIONS.map((s) => s.id));

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/subscriptions", label: "Subscriptions", icon: "CreditCard" },
  { href: "/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/settings", label: "Settings", icon: "Settings" },
] as const;
