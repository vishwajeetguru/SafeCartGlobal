"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Banknote,
  CreditCard,
  Landmark,
  Lock,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface PayMethod {
  label: string;
  sub: string;
  mark: ReactNode;
}

const METHODS: PayMethod[] = [
  {
    label: "UPI",
    sub: "GPay • PhonePe • Paytm",
    mark: (
      <span className="text-2xl font-black italic tracking-tight text-emerald-400">
        UPI
      </span>
    ),
  },
  {
    label: "Visa",
    sub: "Credit • Debit",
    mark: (
      <span className="text-2xl font-black italic tracking-tight text-[#8ea2ff]">
        VISA
      </span>
    ),
  },
  {
    label: "Mastercard",
    sub: "Credit • Debit",
    mark: (
      <span className="flex items-center" aria-hidden="true">
        <span className="h-7 w-7 rounded-full bg-[#EB001B]" />
        <span className="-ml-3 h-7 w-7 rounded-full bg-[#F79E1B]/90" />
      </span>
    ),
  },
  {
    label: "RuPay",
    sub: "Credit • Debit",
    mark: (
      <span className="flex flex-col items-center gap-1">
        <span className="text-xl font-extrabold tracking-tight text-white">
          Ru<span className="text-orange-400">Pay</span>
        </span>
        <span
          aria-hidden="true"
          className="h-0.5 w-10 rounded bg-gradient-to-r from-orange-500 via-white to-green-500"
        />
      </span>
    ),
  },
  {
    label: "Net Banking",
    sub: "All major banks",
    mark: <Landmark className="h-7 w-7 text-sky-300" strokeWidth={1.75} />,
  },
  {
    label: "Wallets",
    sub: "Paytm • Mobikwik",
    mark: <Wallet className="h-7 w-7 text-violet-300" strokeWidth={1.75} />,
  },
  {
    label: "EMI",
    sub: "No-cost options",
    mark: <CreditCard className="h-7 w-7 text-amber-200" strokeWidth={1.75} />,
  },
  {
    label: "Cash on Delivery",
    sub: "Pay at your door",
    mark: <Banknote className="h-7 w-7 text-lime-200" strokeWidth={1.75} />,
  },
];

const TRUST = [
  { icon: Lock, text: "256-bit SSL encrypted checkout" },
  { icon: ShieldCheck, text: "100% buyer protection" },
  { icon: Truck, text: "COD available across India" },
];

export default function PaymentMethods() {
  const sectionRef = useRef<HTMLElement>(null);

  // Staggered tile entrance on scroll.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(".pay-tile", {
        y: 28,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          once: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="payment"
      aria-label="Supported payment methods"
      className="relative overflow-hidden border-t border-white/5 bg-[#0b0f0a] py-20 sm:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[280px] w-[640px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[130px]"
      />

      <div className="relative mx-auto max-w-6xl px-6 text-center sm:px-10">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-lime-200/70">
          100% secure checkout
        </p>
        <h2 className="mx-auto max-w-2xl text-3xl font-black uppercase leading-tight tracking-tight text-white sm:text-4xl">
          Supported Payment Methods
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/55">
          Pay your way — every transaction is encrypted and protected, from UPI
          to cash at your doorstep.
        </p>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {METHODS.map((m) => (
            <div
              key={m.label}
              className="pay-tile flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-6 backdrop-blur-sm transition-colors duration-300 hover:border-white/30"
            >
              <span className="flex h-10 items-center justify-center">
                {m.mark}
              </span>
              <p className="text-[13px] font-semibold text-white/90">
                {m.label}
              </p>
              <p className="text-[11px] tracking-wide text-white/45">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TRUST.map(({ icon: Icon, text }) => (
            <p
              key={text}
              className="flex items-center gap-2 text-xs tracking-wide text-white/55"
            >
              <Icon className="h-4 w-4 text-lime-200" strokeWidth={2} />
              {text}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
