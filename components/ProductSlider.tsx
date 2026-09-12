"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { type Product } from "./ProductCard";

gsap.registerPlugin(ScrollTrigger);

interface ProductSliderProps {
  eyebrow?: string;
  title: string;
  products: Product[];
}

export default function ProductSlider({
  eyebrow,
  title,
  products,
}: ProductSliderProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  // Pinned horizontal scroll: scrolling down pins the section and slides
  // through ALL cards. Only after the last card is shown does the page
  // continue scrolling down.
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }

    const getAmount = () =>
      Math.max(0, track.scrollWidth - window.innerWidth);

    const ctx = gsap.context(() => {
      const tween = gsap.to(track, {
        x: () => -getAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${getAmount()}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            stRef.current = self;
            setProgress(self.progress);
          },
        },
      });
      stRef.current = tween.scrollTrigger as ScrollTrigger;
    }, section);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    // Product images (PNG) change track width once decoded — recalc then.
    track.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", refresh, { once: true });
    });

    return () => {
      window.removeEventListener("load", refresh);
      stRef.current = null;
      ctx.revert();
    };
  }, []);

  // Arrow buttons jump the PAGE scroll (which drives the pin), or the
  // native track when in reduced-motion fallback mode.
  const goTo = (dir: 1 | -1) => {
    const track = trackRef.current;
    const st = stRef.current;
    if (!track) return;
    if (!st) {
      track.scrollBy({ left: dir * 360, behavior: "smooth" });
      return;
    }
    const amount = Math.max(1, track.scrollWidth - window.innerWidth);
    const card = track.querySelector(":scope > article");
    const step = ((card as HTMLElement | null)?.offsetWidth ?? 350) + 20;
    const target =
      st.start +
      Math.min(1, Math.max(0, st.progress + (dir * step) / amount)) *
        (st.end - st.start);
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  const canPrev = progress > 0.02;
  const canNext = progress < 0.98;

  return (
    <section
      ref={sectionRef}
      id="peptides"
      aria-label="Product selection"
      className="relative overflow-hidden bg-[#150a30]"
    >
      {/* Ambient indigo/purple glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-indigo-600/25 blur-[140px]" />
        <div className="absolute bottom-0 left-[8%] h-[300px] w-[420px] rounded-full bg-purple-600/15 blur-[120px]" />
        <div className="absolute bottom-10 right-[5%] h-[260px] w-[380px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0b0f0a] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0b0f0a] to-transparent" />
      </div>

      {/* Pinned viewport — exactly one screen tall */}
      <div className="relative flex h-svh min-h-[640px] flex-col justify-center overflow-hidden py-6">
        {/* Section header */}
        <div className="mx-auto w-full max-w-[1400px] px-5 text-center sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
                {eyebrow}
              </p>
            )}
            <h2 className="mx-auto max-w-3xl text-4xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
              {title}
            </h2>
          </motion.div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => goTo(-1)}
              disabled={!canPrev}
              aria-label="Show previous products"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(1)}
              disabled={!canNext}
              aria-label="Show next products"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Card track — translated by ScrollTrigger while pinned */}
        <div
          className={
            reduced
              ? "scrollbar-hide mt-4 snap-x snap-mandatory overflow-x-auto"
              : "mt-4 overflow-hidden"
          }
        >
          <div
            ref={trackRef}
            className="flex w-max gap-5 pb-2 pl-[max(1.25rem,calc((100vw-87.5rem)/2+2rem))] pr-[8vw] will-change-transform"
          >
            {products.map((product, i) => (
              <ProductCard key={`${product.title}-${i}`} product={product} index={i} />
            ))}
          </div>
        </div>

        {/* Progress hairline */}
        <div className="mx-auto mt-4 h-px w-48 overflow-hidden rounded bg-white/10">
          <div
            className="h-full rounded bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400 transition-[width] duration-150"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
