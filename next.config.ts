import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // On Vercel, each server route runs as its own small function that only
  // contains the files Next.js can SEE it uses. songData.ts builds the path to
  // data/songs.json at runtime, which the tracer cannot follow, so we list the
  // file explicitly for every route. Without this, search returns errors in
  // production even though it works with `npm run dev`.
  outputFileTracingIncludes: {
    "/*": ["./data/songs.json"],
  },
};

export default nextConfig;
