import { CartProvider } from "../components/CartContext";
import Header from "../components/Header";
import HeroScrollCanvas from "../components/HeroScrollCanvas";
import Preloader from "../components/Preloader";
import ProductSlider from "../components/ProductSlider";
import ProductShowcase from "../components/ProductShowcase";
import Testimonials from "../components/Testimonials";
import PaymentMethods from "../components/PaymentMethods";

const peptideProducts = [
  {
    title: "Amritya Nari",
    price: "Rs.749.00",
    imageSrc: "/products/product1.png",
    specs:
      "(BV-349) (100)",
    giantText: "AMRITYA NARI",
  },
  {
    title: "Meal Replacement Ashwagandha Protein Blend (BV-699) (100)",
    price: "Rs.1699.00",
    imageSrc: "/products/product2.png",
    specs: "11mL Multi-dose  •  Purity ≥ 99%",
    giantText: "ASHWAGANDHA",
  },
  {
    title: "Amritya Tulsi (BV-250) (500 ml)",
    price: "Rs.523.95",
    imageSrc: "/products/product3.png",
    specs: "11mL Multi-dose  •  Purity ≥ 99%",
    giantText: "TULSI",
  },
  {
    title: "Amritya Mix Berry (BV-349)",
    price: "Rs.899.00",
    imageSrc: "/products/product4.png",
    specs: "11mL Multi-dose  •  Purity ≥ 99%",
    giantText: "MIX BERRY",
  },
  {
    title: "Protein (Weight Management Protein Blend) (BV-549)",
    price: "Rs.1259.00",
    imageSrc: "/products/product5.png",
    specs: "11mL Multi-dose  •  Purity ≥ 99%",
    giantText: "PROTEIN",
  },
  {
    title: "Amritya Veer (BV-549)",
    price: "Rs.999.00",
    imageSrc: "/products/product6.png",
    specs: "11mL Multi-dose  •  Purity ≥ 99%",
    giantText: "AMRITYA VEER",
  },
];

// Module-level so the array identity is stable — the Preloader effect
// depends on it and must run exactly once, never restart mid-load.
const productImageList = peptideProducts.map((p) => p.imageSrc);

export default function Page() {
  return (
    <main className="bg-[#0b0f0a] text-white">
      <CartProvider>
      {/* Site preloader — counts 0→100 while ALL assets load
          (hero backdrop, 120 scroll frames, product shots, floater sheets) */}
      <Preloader productImages={productImageList} />

      {/* Hidden during hero scroll, slides in after all 120 frames complete */}
      <Header />
      <HeroScrollCanvas />

      <ProductSlider
        eyebrow="Lab-tested • cGMP certified"
        title="Our Peptide Selection"
        products={peptideProducts}
      />

      {/* Single-product spotlight with animated background blobs */}
      <ProductShowcase products={peptideProducts} />

      {/* Content after the 300vh pin — proves the scrub releases cleanly */}
      <section
        id="ritual"
        className="relative mx-auto grid max-w-6xl gap-10 px-6 py-28 sm:px-10 md:grid-cols-3"
      >
        {[
          {
            title: "Cold-pressed",
            body: "Botanicals pressed within hours of harvest to lock in living nutrients.",
          },
          {
            title: "Traceable",
            body: "Every bottle maps back to the farm, field, and harvest date.",
          },
          {
            title: "Nothing synthetic",
            body: "No fragrances, dyes, or fillers. Just plants, water, and light.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur"
          >
            <h2 className="font-display text-2xl italic text-lime-200">
              {f.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              {f.body}
            </p>
          </div>
        ))}
      </section>

      {/* Social proof + checkout trust, above the footer */}
      <Testimonials />
      <PaymentMethods />

      <footer className="border-t border-white/10 px-6 py-10 text-center text-xs tracking-[0.25em] text-white/40 sm:px-10">
        <a
          href="https://www.instagram.com/vishwa__guru"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-lime-200"
        >
          SwiftCart — Powered by Vishwajeet Gawarguru
        </a>
      </footer>
      </CartProvider>
    </main>
  );
}
