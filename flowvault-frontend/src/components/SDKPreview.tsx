"use client";

import { useMemo, useState } from "react";
import { buildDeveloperPreviewSnippet } from "@/lib/playground";

interface SDKPreviewProps {
  lockAmountMicro: number;
  lockDurationBlocks: number;
  splitAmountMicro: number;
  splitAddress: string;
}

export function SDKPreview({
  lockAmountMicro,
  lockDurationBlocks,
  splitAmountMicro,
  splitAddress,
}: SDKPreviewProps) {
  const [isCopied, setIsCopied] = useState(false);

  const snippet = useMemo(
    () =>
      buildDeveloperPreviewSnippet({
        lockAmountMicro,
        lockDurationBlocks,
        splitAmountMicro,
        splitAddress,
      }),
    [lockAmountMicro, lockDurationBlocks, splitAmountMicro, splitAddress],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy code snippet", error);
    }
  };

  return (
    <section className="glass-card-strong rounded-[22px] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">Developer Integration Preview</h3>
          <p className="text-xs text-white/50 mt-1">
            Dynamic SDK snippet generated from your current strategy values.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all"
        >
          {isCopied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#0B0B0D] p-4 text-xs leading-6 text-[#C6D4FF]">
        <code>{snippet}</code>
      </pre>
    </section>
  );
}
