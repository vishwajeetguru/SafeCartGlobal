"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 120;
// --- Frame sizing (frames ONLY, background untouched) ---
// FRAME_SCALE: 1.0 = full-bleed, 0.82 = 18% padding (bottle smaller,
// more spotlight/podium visible). Lower = more padding.
// FRAME_OFFSET_Y: vertical nudge as fraction of screen height
// (+ = down, - = up). 0 = perfectly centered.
const FRAME_SCALE = 0.82;
const FRAME_OFFSET_Y = 0;
const getFrameSrc = (index: number) =>
  `/hero-scroll/hero-scroll (${index}).png`;

export default function HeroScrollCanvas() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [loadProgress, setLoadProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId = 0;
    let killed = false;

    // ---------------------------------------------------------------
    // 1. Preload all 120 frames into memory (async, non-blocking)
    // ---------------------------------------------------------------
    const images: HTMLImageElement[] = new Array(FRAME_COUNT + 1);
    let loadedCount = 0;
    let firstFrameDrawn = false;

    const playhead = { frame: 1 };
    const render = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (killed) return;
        const idx = Math.min(
          FRAME_COUNT,
          Math.max(1, Math.round(playhead.frame))
        );
        const img = images[idx];
        // If target frame isn't decoded yet, fall back to nearest loaded one
        // so we never show a blank canvas while scrubbing.
        const drawable =
          img && img.complete && img.naturalWidth > 0
            ? img
            : findNearestLoaded(idx);

        if (!drawable) return;

        // --- Retina-aware cover-fit draw ---
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = drawable.naturalWidth;
        const ih = drawable.naturalHeight;
        if (!iw || !ih || !cw || !ch) return;

        const scale = Math.max(cw / iw, ch / ih) * FRAME_SCALE;
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2 + ch * FRAME_OFFSET_Y;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        // Transparent clear (NOT opaque fill) so /hero-bg.png shows
        // through the transparent PNG frames for the whole scroll.
        ctx.clearRect(0, 0, cw, ch);
        ctx.drawImage(drawable, dx, dy, dw, dh);
      });
    };

    const findNearestLoaded = (idx: number): HTMLImageElement | null => {
      for (let offset = 0; offset < FRAME_COUNT; offset++) {
        const lo = images[idx - offset];
        if (lo && lo.complete && lo.naturalWidth > 0) return lo;
        const hi = images[idx + offset];
        if (hi && hi.complete && hi.naturalWidth > 0) return hi;
      }
      return null;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      render();
    };

    const drawFirstFrameIfReady = () => {
      if (!firstFrameDrawn) {
        const first = images[1];
        if (first && first.complete && first.naturalWidth > 0) {
          firstFrameDrawn = true;
          resize();
          setIsReady(true);
        }
      }
    };

    // Kick off async preload of every frame.
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = getFrameSrc(i);
      images[i] = img;

      // onload OR onerror both count — a single missing frame must
      // never stall the experience (render() falls back gracefully).
      const onSettled = () => {
        loadedCount += 1;
        setLoadProgress(Math.round((loadedCount / FRAME_COUNT) * 100));
        drawFirstFrameIfReady();
        // Re-draw in case the user already scrolled to a frame
        // that just finished decoding.
        render();
        if (loadedCount === FRAME_COUNT) {
          ScrollTrigger.refresh();
        }
      };
      img.onload = onSettled;
      img.onerror = onSettled;
    }
    // In case frame 1 is cached and already complete:
    drawFirstFrameIfReady();

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    // ---------------------------------------------------------------
    // 2. GSAP ScrollTrigger — bind scroll progress to frame index
    // ---------------------------------------------------------------
    const gctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (!reduceMotion) {
        gsap.to(playhead, {
          frame: FRAME_COUNT,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: true, // direct 1:1 scrub: scroll progress -> frame 1..120
            anticipatePin: 0,
            onUpdate: render,
          },
        });
      } else {
        playhead.frame = 1;
        render();
      }

      // Locked cinematic backdrop: hero-bg.png stays fixed full-bleed
      // underneath the frame sequence. Subtle push-in only (no drift),
      // oversized container guarantees no black bars on any viewport.
      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { scale: 1.06 },
          {
            scale: 1.0,
            yPercent: 0,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      }

      // Cinematic overlay: headline stack drifts up + fades as you scroll.
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          yPercent: -12,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "35% bottom",
            scrub: true,
          },
        });
      }
      if (indicatorRef.current) {
        gsap.to(indicatorRef.current, {
          opacity: 0,
          y: 12,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "12% bottom",
            scrub: true,
          },
        });
      }
      if (progressBarRef.current) {
        gsap.fromTo(
          progressBarRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );
      }

      // Staggered lines reveal on load.
      gsap.fromTo(
        ".hero-intro span",
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          delay: 0.15,
        }
      );
    }, section);

    return () => {
      killed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      gctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-[300vh] bg-[#0b0f0a]"
      aria-label="SwiftCart hero — scroll-driven story"
    >
      {/* Sticky full-screen viewport */}
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-[#0b0f0a]">
        {/* Static cinematic backdrop — /hero-bg.png
            Golden beam, rock plinth, leaves. Locked full-bleed under the
            canvas. Oversized (-inset) so the subtle scale never exposes
            edges — no drift, no black bars. */}
        <div
          ref={bgRef}
          aria-hidden="true"
          className="absolute -inset-[7%] z-0 will-change-transform"
          style={{
            backgroundImage: "url('/hero-bg.png')",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            backgroundRepeat: "no-repeat",
          }}
        />

        {/* Canvas — transparent so hero-bg shows through every frame.
            Retina-scaled in JS, CSS stays full-bleed.
            Fades in once frame 1 is drawable so hero-bg is the poster. */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 z-[1] h-full w-full bg-transparent transition-opacity duration-1000 ${
            isReady ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />

        {/* Readability gradients */}
        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/60 via-transparent to-black/70" />
        <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.45)_100%)]" />

        {/* Progress hairline */}
        <div className="absolute inset-x-0 top-0 z-20 h-[2px] bg-white/10">
          <div
            ref={progressBarRef}
            className="h-full w-full origin-left scale-x-0 bg-gradient-to-r from-lime-200 via-emerald-300 to-lime-200"
          />
        </div>

        {/* Hero headline stack — centered behind the bottle canvas (z-0,
            canvas is z-[1] and transparent, so the bottle floats in front
            of the type). Condensed tall caps, bronze edges with the beam
            burning through the middle, thin white rim light on the glyphs. */}
        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center px-4 text-center"
        >
          <h1 className="hero-intro flex flex-col items-center gap-2 sm:gap-3">
            <span className="font-giant bg-[linear-gradient(90deg,#3a2410_0%,#7a5426_28%,#ffedbe_50%,#7a5426_72%,#3a2410_100%)] bg-clip-text text-[2.6vw] font-black uppercase leading-none tracking-[0.32em] text-transparent drop-shadow-[0_0_18px_rgba(255,200,100,0.3)] [-webkit-text-stroke:1px_rgba(255,255,255,0.35)] lg:text-[1.4vw]">
              Powered by Nature
            </span>
            <span className="font-giant whitespace-nowrap bg-[linear-gradient(90deg,#2e1c0c_0%,#5e3f1c_24%,#ffedbe_50%,#5e3f1c_76%,#2e1c0c_100%)] bg-clip-text text-[9vw] font-black uppercase leading-[0.95] tracking-tight text-transparent drop-shadow-[0_0_35px_rgba(255,200,100,0.35)] [-webkit-text-stroke:1px_rgba(255,255,255,0.35)] lg:text-[5.5vw]">
              Pure Ingredients
            </span>
          </h1>
        </div>

        {/* Scroll indicator (visual only, no text) */}
        <div
          ref={indicatorRef}
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3"
          aria-hidden="true"
        >
          <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/30 p-1.5">
            <span className="h-2 w-1 animate-scroll-dot rounded-full bg-lime-200" />
          </span>
          <span className="h-8 w-px animate-scroll-line bg-white/40" />
        </div>

        {/* Loading veil — hero-bg poster + loader, fades once frame 1 is drawable */}
        <div
          className={`absolute inset-0 z-30 flex items-center justify-center overflow-hidden transition-opacity duration-700 ${
            isReady ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
          aria-hidden={isReady}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage: "url('/hero-bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center 30%",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative h-px w-48 overflow-hidden bg-white/15">
            <div
              className="h-full bg-lime-300 transition-[width] duration-200"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
