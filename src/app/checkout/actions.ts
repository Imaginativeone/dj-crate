"use server";

import { getSongs } from "@/lib/songData";
import { validateOrder, type OrderErrors, type OrderFields } from "./validation";

/**
 * A Server Action: a function the browser can call like a normal async
 * function, but which runs on the server. Next.js creates the HTTP endpoint.
 *
 * Security rule on display: the browser sends only song IDs, and every ID is
 * checked against the real song list here. Never trust data from the
 * browser, because anyone can edit what their browser sends.
 */

export type OrderState =
  | { status: "idle" }
  | { status: "error"; errors: OrderErrors; fields: OrderFields }
  | { status: "success"; orderId: string; count: number; name: string };

export async function placeOrder(_previous: OrderState, formData: FormData): Promise<OrderState> {
  const fields: OrderFields = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    event: String(formData.get("event") ?? ""),
  };

  const all = getSongs();
  const ids = String(formData.get("songIds") ?? "")
    .split(",")
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isInteger(id) && id >= 0 && id < all.length);
  const songs = [...new Set(ids)].map((id) => all[id]);

  const errors = validateOrder(fields, songs.length);
  if (Object.keys(errors).length > 0) return { status: "error", errors, fields };

  // Demo only: a real app would save the order here.
  return {
    status: "success",
    orderId: `DJ-${Date.now().toString(36).toUpperCase()}`,
    count: songs.length,
    name: fields.name.trim(),
  };
}
