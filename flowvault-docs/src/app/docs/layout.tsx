import type { ReactNode } from "react";
import Link from "next/link";
import { DocsSidebar } from "@/components/docs/DocsSidebar";

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="docs-frame">
      <header className="docs-topbar">
        <div className="docs-topbar-title">FlowVault Technical Documentation</div>
        <nav className="docs-topbar-links" aria-label="Quick links">
          <Link href="/docs/getting-started">Quickstart</Link>
          <Link href="/docs/sdk">SDK</Link>
          <Link href="/docs/ai-integration">AI Prompt</Link>
        </nav>
      </header>

      <div className="docs-layout">
        <DocsSidebar />
        <main className="docs-main">{children}</main>
      </div>
    </div>
  );
}
