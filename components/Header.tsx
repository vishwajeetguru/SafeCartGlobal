"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2, X } from "lucide-react";
import { formatINR, useCart } from "./CartContext";

export default function Header() {
  const [visible, setVisible] = useState(false);
  const { items, count, subtotal, setQty, removeItem, cartOpen, closeCart, toggleCart } =
    useCart();

  const setCartOpen = toggleCart;

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

  // Close the mini-cart with Escape
  useEffect(() => {
    if (!cartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, closeCart]);

  // If the header hides (scrolled back into hero), close the cart too
  useEffect(() => {
    if (!visible) closeCart();
  }, [visible, closeCart]);

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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-6 sm:px-10">
          <a
            href="#hero"
            tabIndex={visible ? 0 : -1}
            className="font-display text-lg tracking-[0.2em] text-white"
          >
            SwiftCart
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

          <div className="flex items-center gap-2.5">
            <a
              href="#peptides"
              tabIndex={visible ? 0 : -1}
              className="hidden rounded-full bg-lime-200 px-5 py-2 text-xs font-semibold tracking-[0.15em] text-[#0b0f0a] transition-colors hover:bg-lime-100 sm:inline-block"
            >
              SHOP
            </a>

            {/* Cart button with quantity badge */}
            <button
              type="button"
              onClick={() => toggleCart()}
              tabIndex={visible ? 0 : -1}
              aria-label={`Cart, ${count} items`}
              aria-expanded={cartOpen}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                cartOpen
                  ? "border-lime-200/60 bg-white/15 text-lime-200"
                  : "border-white/15 text-white/85 hover:border-white/40 hover:text-white"
              }`}
            >
              <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.3 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-300 px-1 text-[10px] font-bold text-[#0b0f0a]"
                  >
                    {count > 99 ? "99+" : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mini-cart dropdown */}
      <AnimatePresence>
        {cartOpen && (
          <>
            {/* Click-away layer */}
            <div
              aria-hidden="true"
              className="fixed inset-0 z-[-1] cursor-default"
              onClick={() => closeCart()}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              role="dialog"
              aria-label="Shopping cart"
              className="absolute right-4 top-[72px] z-50 max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#150a30]/95 shadow-2xl shadow-black/60 backdrop-blur-xl sm:right-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
                  Your Cart ({count})
                </p>
                <button
                  type="button"
              onClick={() => closeCart()}
              aria-label="Close cart"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-white/40">
                    <ShoppingBag className="h-5 w-5" />
                  </span>
                  <p className="text-sm text-white/60">Your cart is empty.</p>
                  <button
                    type="button"
                    onClick={() => {
                      closeCart();
                      document
                        .getElementById("peptides")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="mt-1 rounded-full bg-white px-5 py-2 text-[11px] font-semibold tracking-[0.12em] text-indigo-950 transition hover:bg-indigo-100"
                  >
                    BROWSE PRODUCTS
                  </button>
                </div>
              ) : (
                <>
                  <ul className="max-h-[38vh] divide-y divide-white/5 overflow-y-auto px-5">
                    {items.map(({ product, qty }) => (
                      <li key={product.title} className="flex gap-3 py-4">
                        <div className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5 p-1">
                          <Image
                            src={product.imageSrc}
                            alt=""
                            width={48}
                            height={82}
                            className="h-full w-auto object-contain"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="truncate text-[13px] font-medium text-white/90">
                            {product.title}
                          </p>
                          <p className="mt-0.5 text-xs text-white/50">
                            {product.price}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-full border border-white/10 p-0.5">
                              <button
                                type="button"
                                onClick={() => setQty(product.title, qty - 1)}
                                aria-label={`Decrease quantity of ${product.title}`}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold text-white">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQty(product.title, qty + 1)}
                                aria-label={`Increase quantity of ${product.title}`}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(product.title)}
                              aria-label={`Remove ${product.title} from cart`}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-red-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-white/10 px-5 py-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Subtotal</span>
                      <span className="font-semibold text-white">
                        {formatINR(subtotal)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-full bg-lime-200 py-2.5 text-xs font-bold tracking-[0.15em] text-[#0b0f0a] transition hover:bg-lime-100"
                    >
                      PROCEED TO CHECKOUT
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
