import type { NextRequest } from "next/server";
import { searchSongs } from "@/lib/search";
import { getSongs } from "@/lib/songData";
import type { SortKey } from "@/lib/types";

/**
 * GET /api/songs?q=beatles&decade=1960&ones=1&sort=chart&offset=0&limit=100
 *
 * A Route Handler: server code that answers an HTTP request with JSON.
 * The browser never receives the full song list, only one page of matches.
 * Every value from the URL is treated as untrusted and validated here.
 */

const SORTS: readonly SortKey[] = ["chart", "year", "title"];
const MAX_LIMIT = 100;

function toInt(value: string | null, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const sortParam = params.get("sort") as SortKey | null;
  const decadeParam = toInt(params.get("decade"), NaN);

  const page = searchSongs(
    getSongs(),
    {
      q: (params.get("q") ?? "").slice(0, 100),
      decade: Number.isFinite(decadeParam) ? decadeParam : null,
      numberOnesOnly: params.get("ones") === "1",
      sort: sortParam && SORTS.includes(sortParam) ? sortParam : "chart",
    },
    Math.max(0, toInt(params.get("offset"), 0)),
    Math.min(MAX_LIMIT, Math.max(1, toInt(params.get("limit"), MAX_LIMIT))),
  );

  return Response.json(page);
}
