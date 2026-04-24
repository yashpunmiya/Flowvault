"use client";

import { TransactionPreviewModel, formatMicroToUsdcx } from "@/lib/playground";

interface TransactionPreviewProps {
  preview: TransactionPreviewModel;
}

export function TransactionPreview({ preview }: TransactionPreviewProps) {
  return (
    <section className="glass-card-strong rounded-[22px] p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">Transaction Preview</h3>
        <p className="text-xs text-white/50 mt-1">
          Live simulation using your strategy and deposit input before broadcasting.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0A0A0B] p-4 space-y-2">
        <p className="text-sm text-white/80">
          Deposit: <span className="font-mono font-bold text-white">{formatMicroToUsdcx(preview.depositMicro)} USDCx</span>
        </p>
        <p className="text-xs text-white/70">
          → <span className="font-semibold text-purple-300">{formatMicroToUsdcx(preview.lockMicro)} USDCx</span>{" "}
          locked{preview.lockUntilBlock ? ` until block #${preview.lockUntilBlock}` : ""}
        </p>
        <p className="text-xs text-white/70">
          → <span className="font-semibold text-blue-300">{formatMicroToUsdcx(preview.splitMicro)} USDCx</span>{" "}
          sent to {preview.splitAddress ? preview.splitAddress : "recipient address"}
        </p>
        <p className="text-xs text-white/70">
          → <span className="font-semibold text-green-300">{formatMicroToUsdcx(preview.availableMicro)} USDCx</span>{" "}
          available immediately
        </p>
      </div>

      {preview.errors.length > 0 && (
        <div className="space-y-2">
          {preview.errors.map((error) => (
            <p
              key={error}
              className="text-xs rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-200"
            >
              {error}
            </p>
          ))}
        </div>
      )}

      {preview.warnings.length > 0 && (
        <div className="space-y-2">
          {preview.warnings.map((warning) => (
            <p
              key={warning}
              className="text-xs rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-yellow-200"
            >
              {warning}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
