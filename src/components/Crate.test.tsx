import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CartProvider, STORAGE_KEY } from "@/cart/CartContext";
import { testSongs } from "@/lib/testSongs";
import { Crate, setlistText } from "./Crate";

function renderCrate(saved = testSongs.slice(0, 3)) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  return render(
    <CartProvider>
      <Crate />
    </CartProvider>,
  );
}

const titlesInOrder = () =>
  screen.getAllByRole("listitem").map((li) => within(li).getByText(/./, { selector: ".song-title" }).textContent);

beforeEach(() => window.localStorage.clear());

describe("Crate", () => {
  it("shows the saved crate with a track count", async () => {
    renderCrate();
    // The count appears once the saved crate has been loaded from localStorage.
    expect(await screen.findByText("3 tracks")).toBeInTheDocument();
    expect(titlesInOrder()).toEqual(["White Christmas", "I Want To Hold Your Hand", "Respect"]);
  });

  it("reorders with the keyboard-friendly buttons and announces the move", async () => {
    const user = userEvent.setup();
    renderCrate();

    await user.click(await screen.findByRole("button", { name: "Move Respect up" }));

    expect(titlesInOrder()).toEqual(["White Christmas", "Respect", "I Want To Hold Your Hand"]);
    expect(screen.getByRole("status")).toHaveTextContent("Respect moved to position 2 of 3");
    expect(screen.getByRole("button", { name: "Move White Christmas up" })).toBeDisabled();
  });

  it("removes a song and saves the change", async () => {
    const user = userEvent.setup();
    renderCrate();

    await user.click(await screen.findByRole("button", { name: "Remove Respect from crate" }));

    expect(screen.queryByText("Respect")).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toHaveLength(2);
  });

  it("adds up the running time", async () => {
    renderCrate(); // 3:02 + 2:36 + 2:20
    expect(await screen.findByText("Running time 7:58")).toBeInTheDocument();
  });

  it("fills in lengths for a crate saved before lengths existed", async () => {
    // JSON.stringify drops undefined fields, so this saves songs with no durationSec at all.
    const oldCrate = testSongs.slice(0, 3).map((s) => ({ ...s, durationSec: undefined }));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(oldCrate));
    render(
      <CartProvider>
        <Crate />
      </CartProvider>,
    );
    // The same total as above: the made-up length depends only on id and year.
    expect(await screen.findByText("Running time 7:58")).toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    renderCrate([]);
    expect(await screen.findByText("Your crate is empty.")).toBeInTheDocument();
  });

  it("has no automatically detectable accessibility problems", async () => {
    const { container } = renderCrate();
    await screen.findByText("3 tracks");
    expect(await axe(container)).toHaveNoViolations();
  });
});

it("formats a setlist as numbered lines", () => {
  expect(setlistText(testSongs.slice(0, 2))).toBe(
    "1. White Christmas - Bing Crosby (1942, 3:02)\n2. I Want To Hold Your Hand - The Beatles (1964, 2:36)",
  );
});
