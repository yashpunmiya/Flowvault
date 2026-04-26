"use client";

import { TransactionPreviewModel, formatMicroToUsdcx } from "@/lib/playground";

interface TransactionPreviewProps {
  preview: TransactionPreviewModel;
}

export function TransactionPreview({ preview }: TransactionPreviewProps) {
  return (
    <section className="glass-card-strong rounded-[22px] p-5 space-y-4 h-full flex flex-col">
      <div>
        <h3 className="text-sm font-bold text-white">Flow Preview</h3>
        <p className="text-xs text-white/50 mt-1">
          Deposit routing before broadcasting to the FlowVault contract.
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#0A0A0B] p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-stretch">
          <div className="flow-node border border-white/10 bg-white/[0.04] rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase text-white/35">Deposit</p>
            <p className="mt-1 font-mono text-sm font-bold text-white">
              {formatMicroToUsdcx(preview.depositMicro)} USDCx
            </p>
          </div>

          <div
            className="flow-node border border-blue-500/20 bg-blue-500/10 rounded-xl p-3"
            title="Split transfers this amount to the configured recipient during deposit."
          >
            <p className="text-[10px] font-bold uppercase text-blue-200/70">Split</p>
            <p className="mt-1 font-mono text-sm font-bold text-white">
              {formatMicroToUsdcx(preview.splitMicro)} USDCx
            </p>
            <p className="mt-1 truncate text-[10px] text-white/40">
              {preview.splitAddress ?? "No recipient"}
            </p>
          </div>

          <div
            className="flow-node border border-purple-500/20 bg-purple-500/10 rounded-xl p-3"
            title="Lock duration is enforced by comparing the saved unlock block with the current Stacks block height."
          >
            <p className="text-[10px] font-bold uppercase text-purple-200/70">Lock</p>
            <p className="mt-1 font-mono text-sm font-bold text-white">
              {formatMicroToUsdcx(preview.lockMicro)} USDCx
            </p>
            <p className="mt-1 text-[10px] text-white/40" title="A block is the chain height used by the contract.">
              {preview.lockUntilBlock ? `Until #${preview.lockUntilBlock}` : "No lock"}
            </p>
          </div>

          <div className="flow-node border border-green-500/20 bg-green-500/10 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase text-green-200/70">Available</p>
            <p className="mt-1 font-mono text-sm font-bold text-white">
              {formatMicroToUsdcx(preview.availableMicro)} USDCx
            </p>
            <p className="mt-1 text-[10px] text-white/40">Withdrawable now</p>
          </div>
        </div>

        <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/5">
          <div className="absolute inset-y-0 left-0 w-1/2 animate-[flow-line_1.6s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary via-blue-400 to-green-400" />
        </div>
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
