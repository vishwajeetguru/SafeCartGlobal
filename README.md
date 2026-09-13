# SwiftCart

A high-performance, scroll-driven e-commerce experience built with Next.js — featuring a cinematic canvas hero, a pinned horizontal product slider, and a working mini-cart.

**🌐 Live Demo:** https://vishwajeetguru-swiftcart.netlify.app/

**Live sections:** scroll hero (120-frame canvas scrub) → peptide/wellness product slider → brand ritual → footer.

## ✨ Features

- **Cinematic scroll hero** — 120 transparent PNG frames scrubbed 1:1 with scroll (GSAP ScrollTrigger), composited over a golden spotlight stage with a backlit `POWERED BY NATURE / PURE INGREDIENTS` giant-type stack behind the floating bottle
- **Pinned product slider** — scrolling pins the section and slides through all 6 products horizontally; releases after the last card (scroll-driven, with arrow controls + progress hairline)
- **Mini-cart** — header cart icon with animated quantity badge, dropdown with quantity steppers, remove, INR subtotal; add-to-cart with confirmation state on every card
- **Hover marquees** — giant background typography scrolls infinitely on card hover (Framer Motion)
- **Smart header** — hidden during the hero, slides in once the scroll sequence completes
- **Dark luxury theme** — deep indigo/purple gradients, glassmorphic cards, backdrop blur

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2.5 (App Router) |
| UI | React 18.3, TypeScript 5.5 (strict) |
| Styling | Tailwind CSS 3.4, PostCSS, Autoprefixer |
| Scroll animation | GSAP 3.12 + ScrollTrigger |
| Micro-interactions | Framer Motion 13.2 |
| Icons | Lucide React |
| Rendering | Canvas 2D (retina-aware), static prerendering |

## 🚀 Getting Started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve production build
```

## 📁 Project Structure

```
app/
  page.tsx        # Home: hero → slider → ritual → footer (+ product data)
  layout.tsx      # Metadata, hero poster preload
  globals.css     # Tailwind + custom utilities (.font-giant, .scrollbar-hide)
components/
  HeroScrollCanvas.tsx  # 300vh scroll-scrubbed canvas hero
  ProductSlider.tsx     # Pinned horizontal card slider
  ProductCard.tsx       # Product card (marquee, hover actions, add-to-cart)
  CartContext.tsx       # Cart state (items, qty, INR subtotal)
  Header.tsx            # Post-hero header + mini-cart dropdown
public/
  hero-bg.png           # Hero stage backdrop
  hero-scroll/          # 120 transparent scroll frames
  products/             # Product shots (product1–6.png) + vial SVGs
```

## 🛒 Products

Cards are driven by the `peptideProducts` array in `app/page.tsx` — each item takes `title`, `price`, `imageSrc`, `specs`, and `giantText`. Swap images by dropping files into `public/products/` and updating `imageSrc`.

> Checkout is currently a placeholder button — ready to wire to a payments/backend.

## 👤 Credits

**SwiftCart — Powered by [Vishwajeet Gawarguru](https://www.instagram.com/vishwa__guru)**
