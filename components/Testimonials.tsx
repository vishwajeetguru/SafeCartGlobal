"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Testimonial {
  quote: string;
  name: string;
  city: string;
  product: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Two weeks on Amritya Veer and my mornings feel a decade younger. Steady energy through the day — no crash, nothing synthetic.",
    name: "Rajesh Patil",
    city: "Pune",
    product: "Amritya Veer",
    rating: 5,
  },
  {
    quote:
      "Amritya Nari has genuinely balanced my cycle and my mood. My mother has started a bottle too — that says everything.",
    name: "Sunita Sharma",
    city: "Jaipur",
    product: "Amritya Nari",
    rating: 5,
  },
  {
    quote:
      "I replaced my evening whey with the Ashwagandha protein blend. Recovery feels cleaner and sleep is noticeably deeper.",
    name: "Amit Verma",
    city: "New Delhi",
    product: "Ashwagandha Protein Blend",
    rating: 5,
  },
  {
    quote:
      "The Mix Berry tonic is the first health drink my kids actually ask for. Tangy, fresh, and I can taste that it's real fruit.",
    name: "Priya Nair",
    city: "Kochi",
    product: "Amritya Mix Berry",
    rating: 5,
  },
  {
    quote:
      "Three drops of Tulsi in warm water every morning — my seasonal sniffles never arrived this year. Small ritual, big difference.",
    name: "Vikram Singh",
    city: "Lucknow",
    product: "Amritya Tulsi",
    rating: 4,
  },
  {
    quote:
      "Down 6 kilos in three months with the Weight Management blend and evening walks. No jitters, no starving — just steady progress.",
    name: "Kavita Deshmukh",
    city: "Mumbai",
    product: "Weight Management Protein",
    rating: 5,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rated ${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "fill-amber-300 text-amber-300" : "text-white/20"
          }`}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  t,
  num,
  total,
}: {
  t: Testimonial;
  num: string;
  total: number;
}) {
  return (
    <article
      aria-label={`Review from ${t.name}, ${num} of ${total}`}
      className="relative flex w-[82vw] shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm sm:w-[420px] sm:p-9"
    >
      <Quote
        aria-hidden="true"
        className="absolute -top-1 right-5 h-16 w-16 text-white/[0.06]"
      />
      <div className="flex items-center justify-between gap-3">
        <Stars rating={t.rating} />
        <span className="text-xs font-bold tracking-[0.2em] text-white/30">
          {num}/{String(total).padStart(2, "0")}
        </span>
      </div>
      <blockquote className="mt-5 flex-1 text-balance text-lg font-medium leading-relaxed text-white/90">
        “{t.quote}”
      </blockquote>
      <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-6">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime-200 to-emerald-500 text-[13px] font-black text-[#0b0f0a]"
        >
          {t.name
            .split(" ")
            .map((w) => w[0])
            .join("")}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {t.name}
            <span className="font-normal text-white/50"> • {t.city}</span>
          </p>
          <p className="mt-1 inline-block rounded-md bg-lime-200/10 px-2 py-0.5 text-[11px] font-medium tracking-wide text-lime-200">
            {t.product}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  // Pinned horizontal scroll: scrolling down pins the section and slides
  // through ALL reviews. Only after the last card is shown does the page
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

    return () => {
      stRef.current = null;
      ctx.revert();
    };
  }, []);

  // Arrow buttons drive the PAGE scroll (which powers the pin), or the
  // native track in reduced-motion fallback mode.
  const goTo = (dir: 1 | -1) => {
    const track = trackRef.current;
    const st = stRef.current;
    if (!track) return;
    if (!st) {
      track.scrollBy({ left: dir * 380, behavior: "smooth" });
      return;
    }
    const amount = Math.max(1, track.scrollWidth - window.innerWidth);
    const card = track.querySelector(":scope > article");
    const step = ((card as HTMLElement | null)?.offsetWidth ?? 420) + 20;
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
      id="testimonials"
      aria-label="Customer testimonials"
      className="relative overflow-hidden bg-[#0b0f0a]"
    >
      {/* Ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[380px] w-[720px] -translate-x-1/2 rounded-full bg-lime-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-[5%] h-[240px] w-[360px] rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      {reduced ? (
        /* Reduced-motion fallback: plain vertical stack, every review visible. */
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:px-10">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-lime-200/70">
            Loved across India
          </p>
          <h2 className="mx-auto max-w-3xl text-center text-4xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-5xl">
            Stories of Strength
          </h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <ReviewCard
                key={t.name}
                t={t}
                num={String(i + 1).padStart(2, "0")}
                total={TESTIMONIALS.length}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Pinned viewport — exactly one screen tall */
        <div className="relative flex h-svh min-h-[640px] flex-col justify-center overflow-hidden py-6">
          {/* Section header */}
          <div className="mx-auto w-full max-w-[1400px] px-5 text-center sm:px-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-lime-200/70">
              Loved across India
            </p>
            <h2 className="mx-auto max-w-3xl text-4xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-5xl">
              Stories of Strength
            </h2>
            <div className="mt-3 flex items-center justify-center gap-3">
              <Stars rating={5} />
              <p className="text-sm text-white/60">
                <span className="font-bold text-white">4.8/5</span> from 25,000+
                verified reviews
              </p>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => goTo(-1)}
                disabled={!canPrev}
                aria-label="Show previous reviews"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => goTo(1)}
                disabled={!canNext}
                aria-label="Show next reviews"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Card track — translated by ScrollTrigger while pinned */}
          <div className="mt-6 overflow-hidden">
            <div
              ref={trackRef}
              className="flex w-max gap-5 pb-2 pl-[max(1.25rem,calc((100vw-87.5rem)/2+2rem))] pr-[8vw] will-change-transform"
            >
              {TESTIMONIALS.map((t, i) => (
                <ReviewCard
                  key={t.name}
                  t={t}
                  num={String(i + 1).padStart(2, "0")}
                  total={TESTIMONIALS.length}
                />
              ))}
            </div>
          </div>

          {/* Progress hairline + hint */}
          <div className="mx-auto mt-6 flex flex-col items-center gap-2">
            <div className="h-px w-48 overflow-hidden rounded bg-white/10">
              <div
                className="h-full rounded bg-gradient-to-r from-lime-200 via-emerald-300 to-lime-200 transition-[width] duration-150"
                style={{ width: `${Math.max(8, progress * 100)}%` }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/35">
              Keep scrolling to read all reviews
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
