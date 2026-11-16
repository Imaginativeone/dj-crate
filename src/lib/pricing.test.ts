import { cartTotals, formatCents, priceCents } from "./pricing";

describe("pricing", () => {
  it("prices by peak position", () => {
    expect(priceCents({ peak: 1 })).toBe(199);
    expect(priceCents({ peak: 10 })).toBe(149);
    expect(priceCents({ peak: 11 })).toBe(99);
    expect(priceCents({ peak: null })).toBe(99);
  });

  it("gives no discount under 10 tracks", () => {
    const totals = cartTotals(Array.from({ length: 9 }, () => ({ peak: 1 })));
    expect(totals).toEqual({ count: 9, subtotalCents: 1791, discountCents: 0, totalCents: 1791 });
  });

  it("takes 10% off at 10 tracks, in whole cents", () => {
    const totals = cartTotals(Array.from({ length: 10 }, () => ({ peak: 1 })));
    expect(totals).toEqual({ count: 10, subtotalCents: 1990, discountCents: 199, totalCents: 1791 });
  });

  it("formats cents as dollars", () => {
    expect(formatCents(1791)).toBe("$17.91");
    expect(formatCents(5)).toBe("$0.05");
  });
});
