import { searchSongs } from "./search";
import { testSongs } from "./testSongs";
import type { SongQuery } from "./types";

const all: SongQuery = { q: "", decade: null, numberOnesOnly: false, sort: "chart" };
const titles = (query: Partial<SongQuery>, offset?: number, limit?: number) =>
  searchSongs(testSongs, { ...all, ...query }, offset, limit).items.map((s) => s.title);

describe("searchSongs", () => {
  it("returns everything for an empty query", () => {
    expect(searchSongs(testSongs, all).total).toBe(testSongs.length);
  });

  it("matches title or artist, ignoring case", () => {
    expect(titles({ q: "BEATLES" })).toEqual(["I Want To Hold Your Hand", "Revolution"]);
    expect(titles({ q: "respect" })).toEqual(["Respect"]);
  });

  it("requires every word to match, across title and artist", () => {
    // "revolution" is a Beatles title AND part of a Prince artist credit.
    expect(titles({ q: "revolution" })).toHaveLength(2);
    expect(titles({ q: "prince revolution" })).toEqual(["Let's Go Crazy"]);
  });

  it("filters by decade and by number ones", () => {
    expect(titles({ decade: 1960 })).toHaveLength(3);
    expect(titles({ decade: 1960, numberOnesOnly: true })).toHaveLength(2);
  });

  it("sorts biggest hits first by default: best peak, then most weeks", () => {
    expect(titles({})[0]).toBe("When Doves Cry");
    expect(titles({}).at(-1)).toBe("Praise You");
  });

  it("sorts by year and by title", () => {
    expect(titles({ sort: "year" })[0]).toBe("White Christmas");
    expect(titles({ sort: "title" })[0]).toBe("I Want To Hold Your Hand");
  });

  it("pages through results and reports where the next page starts", () => {
    const first = searchSongs(testSongs, all, 0, 3);
    expect(first.items).toHaveLength(3);
    expect(first.nextOffset).toBe(3);

    const last = searchSongs(testSongs, all, 6, 3);
    expect(last.items).toHaveLength(1);
    expect(last.nextOffset).toBeNull();
  });
});
