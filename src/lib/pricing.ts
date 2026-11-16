import type { Song } from "./types";

/**
 * Mock pricing. Nothing here is a real price and nothing is really for sale.
 *
 * Money is kept in integer cents. Floating point cannot represent most
 * decimal fractions exactly (0.1 + 0.2 === 0.30000000000000004), so adding
 * dollars as decimals slowly drifts. Cents as whole numbers never do.
 */

export const BUNDLE_SIZE = 10;
export const BUNDLE_DISCOUNT_PERCENT = 10;

export function priceCents(song: Pick<Song, "peak">): number {
  if (song.peak === 1) return 199;
  if (song.peak !== null && song.peak <= 10) return 149;
  return 99;
}

export type Totals = {
  count: number;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
};

export function cartTotals(items: readonly Pick<Song, "peak">[]): Totals {
  const subtotalCents = items.reduce((sum, song) => sum + priceCents(song), 0);
  const discountCents =
    items.length >= BUNDLE_SIZE
      ? Math.round((subtotalCents * BUNDLE_DISCOUNT_PERCENT) / 100)
      : 0;
  return {
    count: items.length,
    subtotalCents,
    discountCents,
    totalCents: subtotalCents - discountCents,
  };
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
