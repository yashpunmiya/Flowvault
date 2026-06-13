"use client";

import { useState } from "react";

export function RequestFaucetButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddress = address.trim();

    if (!cleanAddress) {
      setError("Please enter your Stacks testnet address.");
      return;
    }
    if (!cleanAddress.startsWith("ST")) {
      setError("Stacks testnet addresses must start with 'ST'.");
      return;
    }
    if (cleanAddress.length < 30 || cleanAddress.length > 50) {
      setError("Please enter a valid Stacks address length (usually 39-41 chars).");
      return;
    }

    setError("");
    const message = `i need testnet usdcx for hackathon ${cleanAddress}`;
    const telegramUrl = `https://t.me/yashpunmiya_dev?text=${encodeURIComponent(message)}`;
    
    // Redirect to Telegram direct message with prefilled message
    window.open(telegramUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setAddress("");
  };

  return (
    <>
      {/* Sticky Faucet Trigger Button in Bottom-Right */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-primary to-[#FF8C39] text-white font-semibold rounded-full shadow-lg shadow-primary/25 hover:scale-105 hover:shadow-primary/40 hover:shadow-xl active:scale-95 transition-all duration-300 group border border-white/10"
        style={{
          boxShadow: "0 10px 25px -5px rgba(255, 94, 19, 0.3)"
        }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <span className="tracking-wide text-sm">Need Testnet USDCx??</span>
      </button>

      {/* Faucet Request Dialog / Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-[fade-in_0.2s_ease-out]">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl relative border border-white/15 animate-[slide-up_0.3s_cubic-bezier(0.16,1,0.3,1)]">
            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                setError("");
                setAddress("");
              }}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-1"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                  🚰
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Request Testnet USDCx</h3>
                  <p className="text-xs text-white/50">Get test USDCx tokens for your FlowVault integrations</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label htmlFor="stacks-address" className="text-xs font-semibold text-white/70 block">
                    Stacks Testnet Address
                  </label>
                  <input
                    id="stacks-address"
                    type="text"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. ST1PQHQKV0RJY225A5HX... (starts with ST)"
                    className="input-field text-sm"
                    autoFocus
                  />
                  {error && (
                    <p className="text-red-500 text-xs font-medium flex items-center gap-1.5 mt-1.5 animate-[fade-in_0.2s_ease-out]">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setError("");
                      setAddress("");
                    }}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white/95 text-sm font-semibold rounded-xl transition-colors border border-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-[#FF8C39] hover:brightness-110 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-98"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
