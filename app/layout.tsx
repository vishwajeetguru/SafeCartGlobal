import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SwiftCart — Shop Share Succeed",
  description:
    "SwiftCart — a high-performance scroll-driven shopping experience. Powered by Nature.",
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
