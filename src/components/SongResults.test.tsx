import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartProvider } from "@/cart/CartContext";
import type { Song } from "@/lib/types";
import { ROW_HEIGHT, SongResults } from "./SongResults";

const manySongs: Song[] = Array.from({ length: 1000 }, (_, id) => ({
  id,
  year: 1990,
  title: `Song ${id}`,
  artist: "Test Artist",
  peak: 50,
  weeks: 5,
  durationSec: 200,
}));

function renderResults(onLoadMore = jest.fn()) {
  render(
    <CartProvider>
      <SongResults items={manySongs} total={5000} hasMore onLoadMore={onLoadMore} />
    </CartProvider>,
  );
  return onLoadMore;
}

beforeEach(() => window.localStorage.clear());

describe("SongResults (virtualized list)", () => {
  it("renders only the rows near the viewport, not all 1,000", () => {
    renderResults();
    const rows = screen.getAllByRole("listitem");
    expect(rows.length).toBeLessThan(30);
    expect(screen.getByText("Song 0")).toBeInTheDocument();
    expect(screen.queryByText("Song 500")).not.toBeInTheDocument();
  });

  it("swaps in different rows when scrolled", () => {
    renderResults();
    fireEvent.scroll(screen.getByRole("region"), { target: { scrollTop: 500 * ROW_HEIGHT } });
    expect(screen.getByText("Song 500")).toBeInTheDocument();
    expect(screen.queryByText("Song 0")).not.toBeInTheDocument();
  });

  it("asks for the next page near the end of the loaded rows", () => {
    const onLoadMore = renderResults();
    fireEvent.scroll(screen.getByRole("region"), { target: { scrollTop: 100 * ROW_HEIGHT } });
    expect(onLoadMore).not.toHaveBeenCalled();
    fireEvent.scroll(screen.getByRole("region"), { target: { scrollTop: 985 * ROW_HEIGHT } });
    expect(onLoadMore).toHaveBeenCalled();
  });

  it("toggles a song in and out of the crate", async () => {
    const user = userEvent.setup();
    renderResults();

    await user.click(screen.getByRole("button", { name: "Add Song 3 by Test Artist to crate" }));
    const toggled = screen.getByRole("button", { name: "Remove Song 3 by Test Artist from crate" });
    expect(toggled).toHaveAttribute("aria-pressed", "true");

    await user.click(toggled);
    expect(
      screen.getByRole("button", { name: "Add Song 3 by Test Artist to crate" }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});
