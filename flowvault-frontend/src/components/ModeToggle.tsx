"use client";

import { StrategyMode } from "@/lib/playground";

interface ModeToggleProps {
  mode: StrategyMode;
  onChange: (mode: StrategyMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
      <button
        type="button"
        onClick={() => onChange("beginner")}
        className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${
          mode === "beginner"
            ? "bg-primary/15 text-primary border border-primary/30"
            : "text-white/45 hover:text-white"
        }`}
      >
        Beginner Mode
      </button>
      <button
        type="button"
        onClick={() => onChange("advanced")}
        className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition-all ${
          mode === "advanced"
            ? "bg-secondary/15 text-secondary-foreground border border-secondary/30"
            : "text-white/45 hover:text-white"
        }`}
      >
        Advanced Mode
      </button>
    </div>
  );
}
