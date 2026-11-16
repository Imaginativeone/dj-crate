"use client";

import Link from "next/link";
import { useCart } from "@/cart/CartContext";

/** Header link showing how many songs are in the crate. */
export function CrateLink() {
  const { items } = useCart();
  return (
    <Link href="/crate" className="crate-link">
      Crate <span className="crate-count">{items.length}</span>
      <span className="visually-hidden">{items.length === 1 ? "song" : "songs"}</span>
    </Link>
  );
}
