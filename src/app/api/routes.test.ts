/**
 * @jest-environment node
 */
// The comment above runs this file in plain Node instead of a fake browser,
// because Route Handlers are server code that use Node's Request/Response.

import { NextRequest } from "next/server";
import { GET as getDecades } from "./decades/route";
import { GET as getSong } from "./songs/[id]/route";

// Calls the handler the way Next.js would for /api/songs/<id>.
function requestSong(id: string) {
  return getSong(new NextRequest(`http://localhost/api/songs/${id}`), {
    params: Promise.resolve({ id }),
  });
}

describe("GET /api/songs/[id]", () => {
  it("returns one song as JSON", async () => {
    const response = await requestSong("0");
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ id: 0, year: 1940, title: "In the Mood" });
  });

  it("answers 404 with a JSON error for an unknown id", async () => {
    const response = await requestSong("99999999");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "No song with id 99999999" });
  });
});

describe("GET /api/decades", () => {
  it("covers every song in the data file", async () => {
    const decades: { decade: number; songs: number }[] = await (await getDecades()).json();
    expect(decades[0].decade).toBe(1940);
    expect(decades.reduce((sum, d) => sum + d.songs, 0)).toBe(39017);
  });
});
