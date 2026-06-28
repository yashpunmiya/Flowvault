"use client";

import { useEffect, useState, useCallback } from "react";

export function BountyCountdown() {
  // Event Start: June 15, 2026 at 09:00:00 AM (Timezone: Asia/Kolkata +05:30)
  const START_DATE = new Date("2026-06-15T09:00:00+05:30").getTime();
  // Submission Deadline: July 5, 2026 at 23:59:00 PM (Timezone: Asia/Kolkata +05:30)
  const SUBMIT_DATE = new Date("2026-07-05T23:59:00+05:30").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    status: "loading" // "before_start" | "running" | "ended" | "loading"
  });

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime();
    let target = START_DATE;
    let status = "before_start";

    if (now >= START_DATE && now < SUBMIT_DATE) {
      target = SUBMIT_DATE;
      status = "running";
    } else if (now >= SUBMIT_DATE) {
      status = "ended";
    }

    const difference = target - now;

    if (difference <= 0 || status === "ended") {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, status: "ended" };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      status
    };
  }, [START_DATE, SUBMIT_DATE]);

  useEffect(() => {
    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (timeLeft.status === "loading") {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 text-center text-white/40">
        Loading countdown...
      </div>
    );
  }

  if (timeLeft.status === "ended") {
    return (
      <div className="w-full max-w-2xl mx-auto glass-panel p-6 rounded-2xl text-center border border-white/10">
        <h3 className="text-xl font-bold text-white mb-1">Hackathon Closed</h3>
        <p className="text-sm text-white/50">The submission deadline has passed. Thank you to all builders!</p>
      </div>
    );
  }

  const statusLabel =
    timeLeft.status === "before_start"
      ? "HACKATHON STARTS IN"
      : "SUBMISSION DEADLINE IN";

  return (
    <div className="w-full max-w-2xl mx-auto glass-panel p-8 rounded-3xl relative overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-2xl">
      {/* Background radial glow */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-primary/10 blur-[60px] pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-secondary/10 blur-[60px] pointer-events-none" />

      <div className="relative z-10 space-y-5 text-center">
        {/* Eyebrow Label with status pulse */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {statusLabel}
        </div>

        {/* Digit Display */}
        <div className="flex justify-center items-center gap-3 md:gap-6">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-20 md:w-24 md:h-28 flex items-center justify-center bg-black/60 border border-white/10 rounded-2xl md:rounded-3xl shadow-inner relative group hover:border-primary/40 transition-colors">
              <span className="text-3xl md:text-5xl font-extrabold text-white text-gradient-primary drop-shadow-[0_0_15px_rgba(255,94,19,0.25)]">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mt-2">Days</span>
          </div>

          <span className="text-xl md:text-3xl font-bold text-white/30 self-start mt-6 md:mt-10 animate-pulse">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-20 md:w-24 md:h-28 flex items-center justify-center bg-black/60 border border-white/10 rounded-2xl md:rounded-3xl shadow-inner relative group hover:border-primary/40 transition-colors">
              <span className="text-3xl md:text-5xl font-extrabold text-white text-gradient-primary drop-shadow-[0_0_15px_rgba(255,94,19,0.25)]">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mt-2">Hours</span>
          </div>

          <span className="text-xl md:text-3xl font-bold text-white/30 self-start mt-6 md:mt-10 animate-pulse">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-20 md:w-24 md:h-28 flex items-center justify-center bg-black/60 border border-white/10 rounded-2xl md:rounded-3xl shadow-inner relative group hover:border-primary/40 transition-colors">
              <span className="text-3xl md:text-5xl font-extrabold text-white text-gradient-primary drop-shadow-[0_0_15px_rgba(255,94,19,0.25)]">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mt-2">Mins</span>
          </div>

          <span className="text-xl md:text-3xl font-bold text-white/30 self-start mt-6 md:mt-10 animate-pulse">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-20 md:w-24 md:h-28 flex items-center justify-center bg-black/60 border border-white/10 rounded-2xl md:rounded-3xl shadow-inner relative group hover:border-primary/45 transition-colors">
              <span className="text-3xl md:text-5xl font-extrabold text-white text-gradient-primary drop-shadow-[0_0_15px_rgba(255,94,19,0.3)]">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
            <span className="text-[10px] md:text-xs font-bold text-white/50 uppercase tracking-widest mt-2">Secs</span>
          </div>
        </div>
      </div>
    </div>
  );
}
