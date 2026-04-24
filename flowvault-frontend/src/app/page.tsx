"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { VaultDashboard } from "@/components/VaultDashboard";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background selection:bg-primary/30 text-foreground">
      {/* Background Gradients - Layer Waves */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] -z-10" />
      <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[80px] -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b-0 border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="w-full max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">FlowVault</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D67D]"></span>
                <p className="text-xs text-white/50 font-medium">Stacks Mainnet</p>
              </div>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Hero Section - Compact */}
      <section className="pt-10 pb-8 px-6 relative">
        <div className="max-w-4xl mx-auto text-center space-y-4 animate-[fade-in_0.8s_ease-out]">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
            Programmable <br />
            <span className="text-gradient-primary">
              USDCx Routing
            </span>
          </h2>
          <p className="text-base text-white/60 max-w-xl mx-auto font-light leading-relaxed">
            Secure, non-custodial vault management on Stacks. Automate your flows with on-chain rules.
            <br />
            <span className="text-primary/80 font-medium">FlowVault turns USDCx deposits into programmable on-chain actions.</span>
          </p>

          {/* Hero Image */}
          <div className="flex justify-center my-6">
            <img 
              src="/hero_image.png" 
              alt="FlowVault Routing Visualization" 
              className="w-[280px] md:w-[400px] object-contain drop-shadow-[0_0_40px_rgba(255,94,19,0.3)] animate-float"
            />
          </div>

          {/* Feature Pills - Glass Style */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="text-primary text-xs">🔒</span>
              <span className="text-xs font-medium">Time-Locked</span>
            </div>
            <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="text-purple-400 text-xs">✂️</span>
              <span className="text-xs font-medium">Auto-Split</span>
            </div>
            <div className="glass-card px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="text-blue-400 text-xs">⚡</span>
              <span className="text-xs font-medium">Bitcoin Finality</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <main className="w-full max-w-[1800px] mx-auto px-6 lg:px-8 pb-24 relative z-10 overflow-hidden">
        <VaultDashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/20 mt-12">
        <div className="w-full max-w-[1800px] mx-auto px-6 text-center">
          <p className="text-white/40 text-sm">
            Built on{" "}
            <a
              href="https://stacks.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Stacks
            </a>{" "}
            &middot; Secured by Bitcoin
          </p>
        </div>
      </footer>
    </div>
  );
}
