/**
 * MADE-UP song lengths. Neither chart archive records how long a song is, so
 * each song gets a believable length for its era instead.
 *
 * The length is computed from the song's id, not from Math.random(). Same id
 * in, same length out, every time, on the server and in the browser. That
 * matters twice over:
 *  - Server HTML and the first browser render must match, or React reports a
 *    hydration mismatch. Math.random() would give each side a different answer.
 *  - A crate saved last week must add up to the same running time today.
 *
 * Safe to import from client code: it is a few lines of maths, no data.
 */

/** [shortest, longest] in seconds, chosen by the decade a song charted. */
export function eraRange(year: number): [min: number, max: number] {
  if (year < 1960) return [135, 195]; // 2:15–3:15, the 78 rpm / early 45 era
  if (year < 1970) return [135, 210]; // 2:15–3:30, radio-length singles
  if (year < 1990) return [180, 285]; // 3:00–4:45
  return [195, 285]; // 3:15–4:45
}

/**
 * Scrambles an integer into another integer that looks random but is fully
 * determined by the input (a "hash"). Neighbouring ids give unrelated results,
 * so songs next to each other in the list don't get similar lengths.
 */
function hash(n: number): number {
  let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0; // >>> 0 makes it a non-negative 32-bit number
}

/** Length in whole seconds for the song with this id and chart year. */
export function songDuration(id: number, year: number): number {
  const [min, max] = eraRange(year);
  return min + (hash(id) % (max - min + 1));
}

/** 161 -> "2:41", 3750 -> "1:02:30". */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
    : `${minutes}:${seconds}`;
}
