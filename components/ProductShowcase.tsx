"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "./CartContext";
import type { Product } from "./ProductCard";

interface ProductShowcaseProps {
  products: Product[];
}

const VEER_SHEET = "/products/flogting-ingradients.png";
const NARI_SHEET = "/products/flogting-ingradientsp1.png";
const MEAL_SHEET = "/products/flogting-ingradientsp2.png";
const TULSI_SHEET = "/products/flogting-ingradientsp3.png";
const MIX_BERRY_SHEET = "/products/flogting-ingradientsp4.png";
const PROTEIN_SHEET = "/products/flogting-ingradientsp21.png";

// All floater sprite sheets — exported so the Preloader can warm them.
export const FLOATER_SHEETS = [
  VEER_SHEET,
  NARI_SHEET,
  MEAL_SHEET,
  TULSI_SHEET,
  MIX_BERRY_SHEET,
  PROTEIN_SHEET,
];

// Shared 6-float orbit — hexagonal ring OUTSIDE the bottle:
// top-left / top-right pair, mid-left / mid-right pair, bottom-left / bottom-right pair.
// Horizontal offsets clear the packshot (mid pair widest); vertical spread is larger
// than one tile so same-side floaters never stack on each other. On narrow screens
// the floaters intentionally tuck *behind* the product (see z-index below).
const FLOAT_POS: string[] = [
  "-translate-x-[8.5rem] -translate-y-24 sm:-translate-x-[15rem] sm:-translate-y-28",
  "translate-x-[8.5rem] -translate-y-24 sm:translate-x-[15rem] sm:-translate-y-28",
  "translate-x-[9.5rem] sm:translate-x-[17.5rem]",
  "-translate-x-[9.5rem] sm:-translate-x-[17.5rem]",
  "-translate-x-[8.5rem] translate-y-24 sm:-translate-x-[15rem] sm:translate-y-28",
  "translate-x-[8.5rem] translate-y-24 sm:translate-x-[15rem] sm:translate-y-28",
];
// Mirrored orbit — same ring flipped left/right, used on alternate products so the
// layout doesn't repeat identically for every product.
const FLOAT_POS_MIRROR: string[] = [
  "translate-x-[8.5rem] -translate-y-24 sm:translate-x-[15rem] sm:-translate-y-28",
  "-translate-x-[8.5rem] -translate-y-24 sm:-translate-x-[15rem] sm:-translate-y-28",
  "-translate-x-[9.5rem] sm:-translate-x-[17.5rem]",
  "translate-x-[9.5rem] sm:translate-x-[17.5rem]",
  "translate-x-[8.5rem] translate-y-24 sm:translate-x-[15rem] sm:translate-y-28",
  "-translate-x-[8.5rem] translate-y-24 sm:-translate-x-[15rem] sm:translate-y-28",
];
const BG_POS_6: string[] = ["0% 0%", "50% 0%", "100% 0%", "0% 100%", "50% 100%", "100% 100%"];

// Per-product optical centering (px, at desktop display size). Measured from each
// packshot PNG's alpha bbox: some renders sit a few px off the image center
// (e.g. Veer's box+bottle bbox center is ~37px right of the PNG center ≈ 12px on
// screen), which made the whole composition read right-heavy vs the arrows.
// Negative = shift left. Applied via margin (never transform — Framer owns that).
const OPTICAL_OFFSET_X: Record<string, number> = {
  "/products/product1.png": -3,
  "/products/product2.png": 0,
  "/products/product3.png": -2,
  "/products/product4.png": -4,
  "/products/product5.png": 0,
  "/products/product6.png": -12,
};

function makeFloaters(prefix: string): Array<{ id: string; bgPos: string }> {
  return BG_POS_6.map((bgPos, i) => ({
    id: `${prefix}-${i}`,
    bgPos,
  }));
}

const AMRITYA_VEER_FLOATERS = makeFloaters("veer");
const NARI_FLOATERS = makeFloaters("nari");
const MEAL_FLOATERS = makeFloaters("meal");
const TULSI_FLOATERS = makeFloaters("tulsi");
const MIX_BERRY_FLOATERS = makeFloaters("mix-berry");
const PROTEIN_FLOATERS = makeFloaters("protein");

export default function ProductShowcase({ products }: ProductShowcaseProps) {
  const [active, setActive] = useState(0);
  const [added, setAdded] = useState(false);
  const hoverRef = useRef(false);
  const addTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addItem, openCart } = useCart();

  const countProducts = products.length;
  const product = products[active];
  const titleLower = product.title.toLowerCase();
  const isVeer = titleLower.includes("amritya veer");
  const isMixBerry = titleLower.includes("mix berry");
  const isMeal = titleLower.includes("meal replacement");
  const isNari = titleLower.includes("amritya nari");
  const isTulsi = titleLower.includes("tulsi");
  const isProtein = titleLower.includes("weight management");
  const activeFloaters = isVeer
    ? AMRITYA_VEER_FLOATERS
    : isMixBerry
      ? MIX_BERRY_FLOATERS
      : isMeal
        ? MEAL_FLOATERS
        : isNari
          ? NARI_FLOATERS
          : isTulsi
            ? TULSI_FLOATERS
            : isProtein
              ? PROTEIN_FLOATERS
              : [];
  const activeSheet = isVeer
    ? VEER_SHEET
    : isMixBerry
      ? MIX_BERRY_SHEET
      : isMeal
        ? MEAL_SHEET
        : isNari
          ? NARI_SHEET
          : isTulsi
            ? TULSI_SHEET
            : isProtein
              ? PROTEIN_SHEET
              : VEER_SHEET;
  const activeBgSize = "300% 200%";
  // Optical nudge so the packshot's true visual center (not the PNG frame
  // center) sits on the stage axis — equalizes the arrow gaps both sides.
  const offsetX = OPTICAL_OFFSET_X[product.imageSrc] ?? 0;

  const go = (dir: 1 | -1) =>
    setActive((i) => (i + dir + countProducts) % countProducts);

  // Gentle auto-rotate; pauses while the section is hovered.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!hoverRef.current && !document.hidden) {
        setActive((i) => (i + 1) % countProducts);
      }
    }, 6000);
    return () => window.clearInterval(id);
  }, [countProducts]);

  useEffect(
    () => () => {
      if (addTimer.current) clearTimeout(addTimer.current);
    },
    []
  );

  // Card "SEE DETAIL" buttons (slider) jump the spotlight to that product.
  useEffect(() => {
    const onShowProduct = (e: Event) => {
      const title = (e as CustomEvent<string>).detail;
      const idx = products.findIndex((p) => p.title === title);
      if (idx >= 0) setActive(idx);
    };
    window.addEventListener("safecart:show-product", onShowProduct);
    return () =>
      window.removeEventListener("safecart:show-product", onShowProduct);
  }, [products]);

  const handleAdd = () => {
    addItem(product);
    openCart();
    setAdded(true);
    if (addTimer.current) clearTimeout(addTimer.current);
    addTimer.current = setTimeout(() => setAdded(false), 1200);
  };

  return (
    <section
      id="featured"
      aria-label="Featured product showcase"
      onPointerEnter={() => {
        hoverRef.current = true;
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
      }}
      className="relative overflow-hidden bg-[#121212]"
    >
      {/* Moody atmosphere: soft top light + vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 70% at 50% 0%, rgba(190,160,110,0.10), transparent 60%), radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#150a30] to-transparent"
      />

      {/* Central stage */}
      <div className="relative mx-auto flex max-w-6xl items-center justify-center px-6 pb-24 pt-16 sm:px-10">
        {/* Arrows */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous product"
          className="absolute left-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[#e8ddc8]/25 text-[#e8ddc8]/80 transition hover:border-[#e8ddc8]/70 hover:text-[#e8ddc8] sm:left-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next product"
          className="absolute right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-[#e8ddc8]/25 text-[#e8ddc8]/80 transition hover:border-[#e8ddc8]/70 hover:text-[#e8ddc8] sm:right-8"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Stage */}
        <div className="relative flex h-[440px] w-full max-w-2xl items-center justify-center sm:h-[500px]">
          {/* Morphing glowing amber blob */}
          <motion.div
            aria-hidden="true"
            className="absolute h-[22rem] w-[22rem] sm:h-[26rem] sm:w-[26rem]"
            animate={{
              borderRadius: [
                "58% 42% 55% 45% / 52% 48% 52% 48%",
                "45% 55% 48% 52% / 58% 42% 58% 42%",
                "52% 48% 60% 40% / 45% 55% 45% 55%",
                "58% 42% 55% 45% / 52% 48% 52% 48%",
              ],
              scale: [1, 1.12, 0.96, 1],
              rotate: [0, 8, -6, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle at 42% 38%, rgba(255,183,77,0.55) 0%, rgba(204,102,34,0.38) 42%, rgba(133,42,14,0.16) 70%, transparent 100%)",
              filter: "blur(52px)",
            }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute h-64 w-64 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background:
                "radial-gradient(circle, rgba(255,120,60,0.28), transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          {/* Floating ingredients — CSS sprite sheets, one per product.
              Wrapper holds side position + entrance fade, inner handles bobbing.
              IMPORTANT: the wrapper must never animate transform (scale/x/y) —
              Framer writes `transform` inline, which would override the Tailwind
              translate positioning and collapse every floater onto the center.
              Tiles sit BEHIND the packshot (z-0 vs product z-10) so any overlap
              reads as depth instead of a glitch. The radial feather mask melts
              the square sprite-tile edges into the dark stage — no boxes.
              Odd-indexed products use the mirrored orbit so positions vary. */}
          {activeFloaters.map((f, i) => (
            <motion.div
              key={`${active}-${f.id}`}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: "easeOut" }}
              className={`pointer-events-none absolute left-1/2 top-1/2 z-0 ${
                (active % 2 === 1 ? FLOAT_POS_MIRROR : FLOAT_POS)[i] ?? ""
              }`}
            >
              <motion.div
                className="h-24 w-24 sm:h-28 sm:w-28"
                style={{
                  backgroundImage: `url(${activeSheet})`,
                  backgroundSize: activeBgSize,
                  backgroundPosition: f.bgPos,
                  backgroundRepeat: "no-repeat",
                  // Soft circular falloff: solid core, fully transparent rim.
                  WebkitMaskImage:
                    "radial-gradient(circle at 50% 50%, black 60%, transparent 78%)",
                  maskImage:
                    "radial-gradient(circle at 50% 50%, black 60%, transparent 78%)",
                  filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))",
                }}
                animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
                transition={{
                  duration: 5 + i * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              />
            </motion.div>
          ))}

          {/* Product image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 48, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -48, scale: 0.96 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="relative z-10"
              style={{ marginLeft: offsetX }}
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src={product.imageSrc}
                  alt={product.title}
                  width={420}
                  height={560}
                  draggable={false}
                  className="h-[330px] w-auto select-none object-contain drop-shadow-[0_32px_32px_rgba(0,0,0,0.65)] sm:h-[400px]"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Soft shadow reflection — follows the product's optical offset */}
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-1/2 h-6 w-48 -translate-x-1/2 rounded-[100%] bg-black/70 blur-lg"
            style={{ marginLeft: offsetX }}
          />

          {/* ADD TO CART — bottom center (wrapper locks centering so Framer scale doesn't fight CSS translate) */}
          <div
            className="absolute -bottom-2 left-1/2 z-30 -translate-x-1/2"
            style={{ marginLeft: offsetX }}
          >
            <motion.button
              type="button"
              onClick={handleAdd}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`flex h-12 w-[192px] items-center justify-center gap-2.5 rounded-full text-xs font-bold tracking-[0.18em] shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-colors ${
                added
                  ? "bg-amber-300 text-[#121212]"
                  : "bg-[#e8ddc8] text-[#121212] hover:bg-[#f5eede]"
              }`}
            >
              {added ? (
                <Check className="h-4 w-4" strokeWidth={2.5} />
              ) : (
                <ShoppingCart className="h-4 w-4" strokeWidth={2.25} />
              )}
              {added ? "ADDED TO CART" : "ADD TO CART"}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Info + thumbnails */}
      <div className="relative z-30 mx-auto max-w-6xl px-6 pb-20 text-center sm:px-10">
        <h3 className="mx-auto max-w-xl text-balance text-2xl font-semibold uppercase leading-tight tracking-wide text-[#e8ddc8] sm:text-3xl">
          {product.title}
        </h3>
        <p className="mt-2 text-lg font-bold text-amber-300">{product.price}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {products.map((p, i) => (
            <button
              key={`${p.title}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${p.title}`}
              aria-pressed={i === active}
              className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border bg-white/[0.04] p-1.5 transition ${
                i === active
                  ? "border-[#e8ddc8]/70"
                  : "border-white/10 opacity-55 hover:opacity-100"
              }`}
            >
              <Image
                src={p.imageSrc}
                alt=""
                width={56}
                height={76}
                className="h-10 w-auto object-contain"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
