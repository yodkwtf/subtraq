"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { QuickAddFab } from "./QuickAddFab";
import { GuestBanner } from "./GuestBanner";
import { SampleDataBanner } from "./SampleDataBanner";
import { PageTransition } from "@/components/page-transition";
import { FxRatesLoader } from "@/components/fx-rates-loader";
import { RenewalReminders } from "@/components/renewal-reminders";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ambient-bg flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <GuestBanner />
        <SampleDataBanner />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 pb-28 pt-6 focus:outline-none sm:px-6 md:pb-10 lg:px-8"
        >
          <div className="mx-auto w-full max-w-7xl">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <MobileNav />
      <QuickAddFab />
      <FxRatesLoader />
      <RenewalReminders />
    </div>
  );
}
