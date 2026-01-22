"use client";

import { WalletConnect } from "@/components/WalletConnect";
import { VaultDashboard } from "@/components/VaultDashboard";
import { DeploymentNotice } from "@/components/DeploymentNotice";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FlowVault</h1>
              <p className="text-xs text-gray-500">Programmable Routing Vault</p>
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Programmable{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              USDCx Routing
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Lock, split, and automate your stablecoin flows on Stacks. 
            Set custom routing rules and let FlowVault handle the rest.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <span className="px-4 py-2 bg-purple-900/30 border border-purple-700/50 rounded-full text-purple-300 text-sm">
              🔒 Time-Locked Savings
            </span>
            <span className="px-4 py-2 bg-blue-900/30 border border-blue-700/50 rounded-full text-blue-300 text-sm">
              ✂️ Auto-Split Deposits
            </span>
            <span className="px-4 py-2 bg-green-900/30 border border-green-700/50 rounded-full text-green-300 text-sm">
              💰 USDCx Stablecoin
            </span>
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <DeploymentNotice />
        <VaultDashboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>
            Built on{" "}
            <a
              href="https://stacks.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Stacks
            </a>{" "}
            · Using{" "}
            <a
              href="https://docs.stacks.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Clarity Smart Contracts
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
