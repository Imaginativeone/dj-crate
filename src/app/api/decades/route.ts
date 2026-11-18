import { countByDecade } from "@/lib/lookups";
import { getSongs } from "@/lib/songData";

/**
 * GET /api/decades  ->  [{ decade: 1940, songs: ..., numberOnes: ... }, ...]
 *
 * This handler never reads the request (no URL params, no cookies), so with
 * Cache Components on, Next.js runs it once at build time and serves the
 * saved JSON to everyone. `npm run build` lists it as a static (○) route.
 * The search route can't do that: its answer depends on what you typed.
 */
export async function GET() {
  return Response.json(countByDecade(getSongs()));
}
