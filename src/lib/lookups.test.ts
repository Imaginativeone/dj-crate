import { countByDecade, findSong } from "./lookups";
import { testSongs } from "./testSongs";

describe("findSong", () => {
  it("finds a song by its id", () => {
    expect(findSong(testSongs, "2")?.title).toBe("Respect");
  });

  it.each(["7", "-1", "1.5", "1e0", "0x1", " 2", "", "abc", "9999999999"])(
    "returns null for %j",
    (rawId) => {
      expect(findSong(testSongs, rawId)).toBeNull();
    },
  );
});

describe("countByDecade", () => {
  it("counts songs and number ones per decade, oldest first", () => {
    expect(countByDecade(testSongs)).toEqual([
      { decade: 1940, songs: 1, numberOnes: 1 },
      { decade: 1960, songs: 3, numberOnes: 2 },
      { decade: 1980, songs: 2, numberOnes: 2 },
      { decade: 1990, songs: 1, numberOnes: 0 },
    ]);
  });
});
