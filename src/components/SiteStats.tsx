import { getSongs } from "@/lib/songData";

/**
 * A Server Component: it runs only on the server and sends finished HTML.
 * No JavaScript for this component is shipped to the browser.
 *
 * "use cache" tells Next.js the output can be computed once and reused, so
 * it becomes part of the page's instant static shell instead of being
 * recalculated for every visitor.
 */
export async function SiteStats() {
  "use cache";

  const songs = getSongs();
  const numberOnes = songs.filter((s) => s.peak === 1).length;
  const firstYear = songs[0].year;
  const lastYear = songs[songs.length - 1].year;

  return (
    <p className="stats">
      {songs.length.toLocaleString("en-US")} charting songs ·{" "}
      {numberOnes.toLocaleString("en-US")} number ones · {firstYear}–{lastYear}
    </p>
  );
}
