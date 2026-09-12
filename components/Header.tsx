"use client";

import { useEffect, useState } from "react";

export default function Header() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const check = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // Show only after the 300vh hero has fully scrolled past:
        // heroBottom (300vh) - viewport (100vh) = show after ~200vh of scroll.
        const hero = document.getElementById("hero");
        const heroHeight = hero?.offsetHeight ?? window.innerHeight * 3;
        const pastHero = window.scrollY > heroHeight - window.innerHeight - 24;
        setVisible(pastHero);
      });
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
      aria-hidden={!visible}
    >
      <div className="border-b border-white/10 bg-[#0b0f0a]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-10">
          <a
            href="#hero"
            tabIndex={visible ? 0 : -1}
            className="font-display text-lg tracking-[0.2em] text-white"
          >
            ELIXIR
          </a>

          <nav className="hidden items-center gap-8 text-xs tracking-[0.2em] text-white/60 md:flex">
            <a href="#ritual" tabIndex={visible ? 0 : -1} className="transition-colors hover:text-lime-200">
              RITUAL
            </a>
            <a href="#ritual" tabIndex={visible ? 0 : -1} className="transition-colors hover:text-lime-200">
              TRACEABLE
            </a>
            <a href="#ritual" tabIndex={visible ? 0 : -1} className="transition-colors hover:text-lime-200">
              INGREDIENTS
            </a>
          </nav>

          <a
            href="#peptides"
            tabIndex={visible ? 0 : -1}
            className="rounded-full bg-lime-200 px-5 py-2 text-xs font-semibold tracking-[0.15em] text-[#0b0f0a] transition-colors hover:bg-lime-100"
          >
            SHOP ELIXIR
          </a>
        </div>
      </div>
    </header>
  );
}
