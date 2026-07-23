export type Category =
  | "Streaming"
  | "Music"
  | "Gaming"
  | "SaaS"
  | "AI Tools"
  | "Developer Tools"
  | "Productivity"
  | "Design"
  | "Cloud"
  | "Storage"
  | "Domain"
  | "Security"
  | "Education"
  | "Health & Fitness"
  | "News"
  | "Finance"
  | "Shopping"
  | "Food"
  | "Social"
  | "Utilities"
  | "Other";

export type BillingCycle = "Monthly" | "Quarterly" | "Annually";

export type Status = "Active" | "Paused" | "Cancelled";

export interface Subscription {
  id: string;
  name: string;
  logo?: string;
  category: Category;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  nextRenewalDate: string;
  startDate: string;
  notes?: string;
  status: Status;
  url?: string;
}

export type ActivityType = "added" | "edited" | "cancelled" | "paused" | "resumed";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  subscriptionName: string;
  timestamp: string;
}

export interface AiSuggestion {
  id: string;
  name: string;
  reason: string;
  potentialSaving: number;
}

export type CurrencyCode =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "CAD"
  | "SGD"
  | "AED"
  | "CNY"
  | "CHF"
  | "BRL"
  | "ZAR"
  | "NZD";

export interface Settings {
  currency: CurrencyCode;
  reminderThreshold: 3 | 7 | 14;
  name?: string;
  /** When true, fire a browser notification for renewals within the threshold. */
  notifyRenewals?: boolean;
}
