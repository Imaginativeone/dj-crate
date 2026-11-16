import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout · DJ Crate" };

export default function CheckoutPage() {
  return (
    <>
      <h1>Checkout</h1>
      <CheckoutForm />
    </>
  );
}
