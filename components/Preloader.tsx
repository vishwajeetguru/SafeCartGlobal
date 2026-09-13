"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FLOATER_SHEETS } from "./ProductShowcase";

interface PreloaderProps {
  productImages?: string[];
  heroFrameCount?: number;
  onDone?: () => void;
}

export default function Preloader({
  productImages = [],
  heroFrameCount = 120,
  onDone,
}: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const startedAt = useRef(0);
  // Ref so the effect doesn't re-run when the parent re-renders.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    // Build the full asset manifest: hero backdrop + frames +
    // product shots + floater sprite sheets.
    const frame = (i: number) => `/hero-scroll/hero-scroll (${i}).png`;
    const assets = [
      "/hero-bg.png",
      ...Array.from({ length: heroFrameCount }, (_, i) => frame(i + 1)),
      ...productImages,
      ...FLOATER_SHEETS,
    ];
    const total = assets.length;

    let settled = 0;
    let cancelled = false;
    const timers: number[] = [];

    startedAt.current = performance.now();

    // Lock page scroll behind the veil so the reveal always starts at top.
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    const unlockScroll = () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };

    // Even a failed/timed-out asset counts — the loader must never stall.
    const onSettled = () => {
      if (cancelled) return;
      settled += 1;
      setProgress(Math.round((settled / total) * 100));
      if (settled === total) finish();
    };

    // An asset counts only after its bitmap is DECODED (not just downloaded),
    // so 100% really means every frame/shot/sheet is ready to draw smoothly.
    // Each asset gets a generous timeout so one stalled file can never hang
    // the loader — it counts as settled and we move on.
    const PER_ASSET_TIMEOUT_MS = 60000;
    const preload = (src: string) => {
      let timer = 0;
      const settleOnce = () => {
        if (timer) {
          window.clearTimeout(timer);
          timer = 0;
        }
        onSettled();
      };
      timer = window.setTimeout(settleOnce, PER_ASSET_TIMEOUT_MS);
      timers.push(timer);
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        if (typeof img.decode === "function") {
          img.decode().then(settleOnce).catch(settleOnce);
        } else {
          settleOnce();
        }
      };
      img.onerror = settleOnce;
      img.src = src;
    };

    // Parallel preload; progress ticks up as each asset settles.
    assets.forEach(preload);

    function finish() {
      if (cancelled) return;
      // Small minimum dwell so fast networks still see the counter.
      const minDwell = 900;
      const elapsed = performance.now() - startedAt.current;
      const wait = Math.max(0, minDwell - elapsed);
      const t = window.setTimeout(() => {
        if (cancelled) return;
        unlockScroll();
        setProgress(100);
        setDone(true);
        onDoneRef.current?.();
      }, wait);
      timers.push(t);
    }

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      unlockScroll();
    };
  }, [productImages, heroFrameCount]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0f0a]"
          aria-label="Loading assets"
          aria-hidden={done}
        >
          {/* Soft ambient glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 45%, rgba(217,164,74,0.12), transparent 70%)",
            }}
          />

          <div className="relative flex flex-col items-center gap-6 px-6">
            <p className="font-display text-lg tracking-[0.3em] text-[#e8ddc8]">
              SwiftCart
            </p>

            {/* Counter */}
            <p
              className="font-giant text-6xl font-black tabular-nums text-white sm:text-7xl"
              aria-live="polite"
            >
              {progress}
              <span className="text-3xl text-white/40 sm:text-4xl">%</span>
            </p>

            {/* Progress hairline */}
            <div className="h-px w-56 overflow-hidden rounded bg-white/15">
              <div
                className="h-full bg-gradient-to-r from-lime-200 via-emerald-300 to-lime-200 transition-[width] duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
              Loading experience
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
