import type { NextRequest } from "next/server";
import { findSong } from "@/lib/lookups";
import { getSongs } from "@/lib/songData";

/**
 * GET /api/songs/12141  ->  one song as JSON, or 404.
 *
 * The folder name `[id]` makes this a DYNAMIC route: one file answers for
 * every id. Next.js hands us the matched part of the URL in `ctx.params`.
 * In Next.js 15 and later `params` is a Promise, so it must be awaited.
 * `RouteContext<"/api/songs/[id]">` is a type Next.js generates from the
 * folder structure, so `id` is known to exist and to be a string.
 */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/songs/[id]">) {
  const { id } = await ctx.params;
  const song = findSong(getSongs(), id);

  // A missing song is the caller's mistake, not a server crash: answer with
  // status 404 and a JSON body, so fetch() code can check `response.ok`.
  if (!song) return Response.json({ error: `No song with id ${id}` }, { status: 404 });

  return Response.json(song);
}
