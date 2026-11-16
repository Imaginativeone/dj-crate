import { renderHook, waitFor } from "@testing-library/react";
import { searchSongs } from "@/lib/search";
import { testSongs } from "@/lib/testSongs";
import type { SongQuery } from "@/lib/types";
import { buildSearchUrl, useSongSearch } from "./useSongSearch";

const base: SongQuery = { q: "", decade: null, numberOnesOnly: false, sort: "chart" };

/** A stand-in for the real API: answers from the test song list after `delayMs`. */
function mockApi(delayFor: (q: string) => number = () => 0) {
  global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const params = new URL(String(input), "http://test").searchParams;
    const q = params.get("q") ?? "";
    const page = searchSongs(testSongs, { ...base, q }, Number(params.get("offset")), 3);
    return new Promise<Response>((resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      setTimeout(() => resolve({ ok: true, json: async () => page } as Response), delayFor(q));
    });
  }) as jest.Mock;
}

describe("buildSearchUrl", () => {
  it("includes only the filters that are set", () => {
    expect(buildSearchUrl(base, 0)).toBe("/api/songs?q=&sort=chart&offset=0");
    expect(buildSearchUrl({ ...base, q: "a b", decade: 1980, numberOnesOnly: true }, 100)).toBe(
      "/api/songs?q=a+b&sort=chart&offset=100&decade=1980&ones=1",
    );
  });
});

describe("useSongSearch", () => {
  it("loads the first page, then appends the next", async () => {
    mockApi();
    const { result } = renderHook(() => useSongSearch(base));

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toHaveLength(3);
    expect(result.current.total).toBe(testSongs.length);
    expect(result.current.hasMore).toBe(true);

    result.current.loadMore();
    await waitFor(() => expect(result.current.items).toHaveLength(6));
  });

  it("ignores a slow, out-of-date response (race condition)", async () => {
    // The first query is slow; the second is fast. The slow one must lose.
    mockApi((q) => (q === "beatles" ? 80 : 0));
    const { result, rerender } = renderHook(({ q }) => useSongSearch({ ...base, q }), {
      initialProps: { q: "beatles" },
    });
    rerender({ q: "prince" });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(result.current.items.every((s) => s.artist.startsWith("Prince"))).toBe(true);
  });

  it("reports an error when the request fails", async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 500 }) as Response) as jest.Mock;
    const { result } = renderHook(() => useSongSearch(base));
    await waitFor(() => expect(result.current.error).toBe("Search failed (500)"));
  });
});
