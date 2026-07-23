import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscriptions",
  description: "Search, filter, and manage every recurring payment you track.",
};

export default function SubscriptionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
