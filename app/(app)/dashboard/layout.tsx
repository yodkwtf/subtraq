import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your subscription overview: spend, upcoming renewals, and AI insights.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
