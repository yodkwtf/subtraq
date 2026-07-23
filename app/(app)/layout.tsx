import type { Metadata } from "next";
import { AuthGate } from "@/components/auth/AuthGate";
import { DataBoundary } from "@/components/auth/DataBoundary";
import { EditorProvider } from "@/components/editor-context";
import { AppShell } from "@/components/layout/AppShell";

// Private app routes should never be indexed by search engines.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <EditorProvider>
        <AppShell>
          <DataBoundary>{children}</DataBoundary>
        </AppShell>
      </EditorProvider>
    </AuthGate>
  );
}
