import type { Metadata } from "next";
import Link from "next/link";
import { CartProvider } from "@/cart/CartContext";
import { CrateLink } from "@/components/CrateLink";
import "./globals.css";

export const metadata: Metadata = {
  title: "DJ Crate",
  description: "Search every U.S. charting song since 1940 and build a setlist.",
};

/**
 * The root layout is a Server Component. CartProvider is a Client Component,
 * but the pages passed through it as `children` can still be Server
 * Components: "use client" marks where the browser bundle STARTS, it does
 * not turn everything nested inside into client code.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {/* First focusable element: lets keyboard users jump past the header. */}
          <a href="#main" className="skip-link">
            Skip to main content
          </a>
          <header className="site-header">
            <Link href="/" className="brand">
              DJ Crate
            </Link>
            <nav aria-label="Main">
              <Link href="/">Search</Link>
              <CrateLink />
            </nav>
          </header>
          <main id="main">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
