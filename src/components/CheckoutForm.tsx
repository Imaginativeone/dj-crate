"use client";

import Link from "next/link";
import { useActionState } from "react";
import { placeOrder, type OrderState } from "@/app/checkout/actions";
import { useCart, useCartDispatch } from "@/cart/CartContext";
import { cartTotals, formatCents } from "@/lib/pricing";

const idle: OrderState = { status: "idle" };

export function CheckoutForm() {
  const { items, hydrated } = useCart();
  const dispatch = useCartDispatch();

  // useActionState runs the action when the form is submitted and gives us
  // its latest result plus an `isPending` flag for the "Placing order…" state.
  const [state, formAction, isPending] = useActionState(
    async (previous: OrderState, formData: FormData) => {
      const result = await placeOrder(previous, formData);
      if (result.status === "success") dispatch({ type: "cleared" });
      return result;
    },
    idle,
  );

  if (state.status === "success") {
    return (
      <div className="confirmation" role="status">
        <h2>Thanks, {state.name}!</h2>
        <p>
          Order <strong>{state.orderId}</strong>: {state.count}{" "}
          {state.count === 1 ? "track" : "tracks"}, {formatCents(state.totalCents)}.
        </p>
        <p className="hint">This is a demo. No payment was taken and nothing will be sent.</p>
        <Link href="/" className="button is-primary">
          Build another crate
        </Link>
      </div>
    );
  }

  if (!hydrated) return <p className="empty">Loading your crate…</p>;

  if (items.length === 0) {
    return (
      <div className="empty">
        <p>Your crate is empty, so there is nothing to check out.</p>
        <Link href="/" className="button">
          Find some songs
        </Link>
      </div>
    );
  }

  const errors = state.status === "error" ? state.errors : {};
  const fields = state.status === "error" ? state.fields : { name: "", email: "", event: "" };
  const totals = cartTotals(items);

  return (
    <form action={formAction} className="checkout-form" noValidate>
      <p>
        {totals.count} {totals.count === 1 ? "track" : "tracks"} ·{" "}
        <strong>{formatCents(totals.totalCents)}</strong>
      </p>

      {Object.keys(errors).length > 0 && (
        // role="alert" is announced immediately, so the user learns the
        // submit failed even though the page did not reload.
        <p className="error" role="alert">
          Please fix the highlighted fields.
        </p>
      )}

      <input type="hidden" name="songIds" value={items.map((s) => s.id).join(",")} />

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          defaultValue={fields.name}
          required
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" className="field-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={fields.email}
          required
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="field-error">
            {errors.email}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="event">
          Event name <span className="hint">(optional)</span>
        </label>
        <input id="event" name="event" defaultValue={fields.event} />
      </div>

      <button type="submit" className="button is-primary" disabled={isPending}>
        {isPending ? "Placing order…" : "Place demo order"}
      </button>
      <p className="hint">Demo store. No payment details are collected.</p>
    </form>
  );
}
