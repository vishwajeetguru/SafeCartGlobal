"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ShoppingCart } from "lucide-react";

export interface Product {
  title: string;
  price: string;
  imageSrc: string;
  specs: string;
  giantText: string;
}

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.08, ease: "easeOut" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative flex h-[440px] w-[76%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-sm transition-colors duration-300 hover:border-white/50 sm:w-[46%] lg:w-[31.5%] xl:w-[23.4%]"
    >
      {/* Hover gradient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 38%, rgba(129,140,248,0.22), transparent 70%), linear-gradient(to bottom, rgba(139,92,246,0.12), transparent 55%)",
        }}
      />

      {/* Header */}
      <div className="relative z-10 px-4 pt-5 text-center">
        <h3 className="truncate text-[13px] font-medium uppercase tracking-[0.08em] text-white/90">
          {product.title}
        </h3>
        <span className="mt-2 inline-block rounded-md bg-white/10 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/80">
          {product.price}
        </span>
      </div>

      {/* Body */}
      <div className="relative z-10 flex flex-1 items-center justify-center overflow-hidden">
        {/* Giant background text — static idle, auto-loop marquee on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          {!hovered ? (
            <span className="whitespace-nowrap text-[64px] font-black uppercase leading-none tracking-tight text-white/[0.09]">
              {product.giantText}
            </span>
          ) : (
            <motion.div
              key="giant-marquee"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex shrink-0"
            >
              <motion.div
                initial={{ x: "0%" }}
                animate={{ x: "-50%" }}
                transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                className="flex shrink-0 whitespace-nowrap"
              >
                {[0, 1].map((copy) => (
                  <span
                    key={copy}
                    className="pr-10 text-[64px] font-black uppercase leading-none tracking-tight text-white/[0.17]"
                  >
                    {product.giantText}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Product image */}
        <motion.div
          animate={{ scale: hovered ? 1.07 : 1, y: hovered ? -6 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative"
        >
          <Image
            src={product.imageSrc}
            alt={product.title}
            width={200}
            height={340}
            draggable={false}
            className="h-60 w-auto select-none object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.55)]"
          />
        </motion.div>

        {/* Bottom reflection shadow */}
        <div
          aria-hidden="true"
          className="absolute bottom-6 left-1/2 h-5 w-32 -translate-x-1/2 rounded-[100%] bg-black/60 blur-md transition-all duration-500 group-hover:w-36 group-hover:bg-indigo-950/80"
        />
      </div>

      {/* Footer */}
      <p className="relative z-10 px-5 pb-14 text-center text-[11px] leading-relaxed tracking-wide text-white/45">
        {product.specs}
      </p>

      {/* Hover actions */}
      <motion.div
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 14 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2.5 ${
          hovered ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <button
          type="button"
          aria-label={`Add ${product.title} to cart`}
          tabIndex={hovered ? 0 : -1}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
        >
          <ShoppingCart className="h-4 w-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          tabIndex={hovered ? 0 : -1}
          className="group/btn flex h-10 items-center gap-2 rounded-full bg-white py-0 pl-4 pr-1.5 text-[11px] font-semibold tracking-[0.12em] text-indigo-950 transition-colors hover:bg-indigo-100"
        >
          SEE DETAIL
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-indigo-950/20">
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-px group-hover/btn:-translate-y-px" strokeWidth={2.25} />
          </span>
        </button>
      </motion.div>
    </motion.article>
  );
}
