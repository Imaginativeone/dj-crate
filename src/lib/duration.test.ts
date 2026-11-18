import { eraRange, formatDuration, songDuration } from "./duration";

describe("songDuration", () => {
  it("gives the same song the same length every time", () => {
    expect(songDuration(1234, 1967)).toBe(songDuration(1234, 1967));
  });

  it("stays inside the range for the song's era", () => {
    for (const year of [1940, 1959, 1960, 1975, 1989, 1990, 2024]) {
      const [min, max] = eraRange(year);
      for (let id = 0; id < 2000; id++) {
        const length = songDuration(id, year);
        expect(length).toBeGreaterThanOrEqual(min);
        expect(length).toBeLessThanOrEqual(max);
      }
    }
  });

  it("spreads lengths across the range instead of bunching them", () => {
    const lengths = new Set(Array.from({ length: 500 }, (_, id) => songDuration(id, 1985)));
    expect(lengths.size).toBeGreaterThan(80); // 106 possible values for 3:00–4:45
  });
});

describe("formatDuration", () => {
  it.each([
    [0, "0:00"],
    [65, "1:05"],
    [161, "2:41"],
    [3600, "1:00:00"],
    [3750, "1:02:30"],
  ])("%i seconds -> %s", (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
  });
});
