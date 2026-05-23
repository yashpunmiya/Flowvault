"use client";

import Image from "next/image";
import Link from "next/link";
import { DemoAppsDropdown } from "@/components/DemoAppsDropdown";
import { WalletConnect } from "@/components/WalletConnect";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b-0 border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 sm:gap-4 group min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Image src="/logo.png" alt="FlowVault logo" width={48} height={48} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">FlowVault</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D67D]" />
              <p className="text-xs text-white/50 font-medium">Stacks Testnet</p>
            </div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link className="site-nav-link" href="/">
            App
          </Link>
          <Link className="site-nav-link site-nav-link-strong" href="/bounty">
            Bounty
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <DemoAppsDropdown />
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
