import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Spend trends, category breakdowns, and billing cadence for your subscriptions.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
