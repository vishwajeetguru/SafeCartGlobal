import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elixir — Powered by Nature, Pure Ingredients",
  description:
    "A high-performance scroll-driven hero experience. Powered by Nature, Pure Ingredients.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preload cinematic hero poster for instant first paint */}
        <link rel="preload" as="image" href="/hero-bg.png" fetchPriority="high" />
      </head>
      <body className="bg-[#0b0f0a] text-white antialiased">{children}</body>
    </html>
  );
}
