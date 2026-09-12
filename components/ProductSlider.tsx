"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard, { type Product } from "./ProductCard";

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
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ down: false, startX: 0, startScroll: 0 });
  const [progress, setProgress] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState, products.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
  };

  // Mouse-drag to scroll (touch scrolls natively)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    dragState.current = { down: true, startX: e.clientX, startScroll: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!el || !dragState.current.down) return;
    el.scrollLeft = dragState.current.startScroll - (e.clientX - dragState.current.startX);
  };
  const endDrag = () => {
    dragState.current.down = false;
  };

  return (
    <section
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

      <div className="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 md:py-24">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          {eyebrow && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
              {eyebrow}
            </p>
          )}
          <h2 className="mx-auto max-w-3xl text-4xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
            {title}
          </h2>
        </motion.div>

        {/* Controls */}
        <div className="mt-8 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canPrev}
            aria-label="Scroll products left"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canNext}
            aria-label="Scroll products right"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable track — 4 cards in view on xl, scrolls to reveal all */}
        <div
          ref={trackRef}
          onScroll={updateScrollState}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          className="scrollbar-hide -mx-5 mt-6 flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 active:cursor-grabbing sm:-mx-8 sm:px-8"
        >
          {products.map((product, i) => (
            <ProductCard key={`${product.title}-${i}`} product={product} index={i} />
          ))}
        </div>

        {/* Progress hairline */}
        <div className="mx-auto mt-8 h-px w-48 overflow-hidden rounded bg-white/10">
          <div
            className="h-full rounded bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400 transition-[width] duration-150"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>
      </div>
    </section>
  );
}
