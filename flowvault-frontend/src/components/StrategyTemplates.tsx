"use client";

import { StrategyTemplateId, STRATEGY_TEMPLATES } from "@/lib/playground";

interface StrategyTemplatesProps {
  activeTemplate: StrategyTemplateId | null;
  basisDepositUsdcx: number;
  onUseTemplate: (templateId: StrategyTemplateId) => void;
}

export function StrategyTemplates({
  activeTemplate,
  basisDepositUsdcx,
  onUseTemplate,
}: StrategyTemplatesProps) {
  const previewBasis = basisDepositUsdcx > 0 ? basisDepositUsdcx : 100;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h4 className="text-base font-semibold text-white">Start with a Strategy</h4>
          <p className="text-xs text-white/50 mt-1">
            One click fills strategy inputs using {previewBasis.toFixed(2)} USDCx as the deposit basis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STRATEGY_TEMPLATES.map((template) => {
          const lockAmount = (previewBasis * template.lockPercent) / 100;
          const splitAmount = (previewBasis * template.splitPercent) / 100;

          return (
            <article
              key={template.id}
              className={`rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 ${
                activeTemplate === template.id
                  ? "border-primary/40 bg-primary/5"
                  : "border-white/10 bg-[#0F0F11] hover:border-white/20"
              }`}
            >
              <h5 className="text-sm font-semibold text-white">{template.title}</h5>
              <p className="text-xs text-white/55 leading-relaxed mt-2 min-h-10">
                {template.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {template.lockPercent > 0 && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-200">
                    Savings Lock {template.lockPercent}% ({lockAmount.toFixed(2)} USDCx)
                  </span>
                )}
                {template.splitPercent > 0 && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-200">
                    Auto Payment {template.splitPercent}% ({splitAmount.toFixed(2)} USDCx)
                  </span>
                )}
                {template.requiresSplitAddress && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-200">
                    Recipient required
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onUseTemplate(template.id)}
                className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white/85 hover:text-white hover:bg-white/10 transition-all"
              >
                Use Template
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
