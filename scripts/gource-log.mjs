#!/usr/bin/env node
/**
 * Writes gource/dj-crate.log: this repo's git history in Gource's
 * "custom log" format (timestamp|author|A/M/D|path).
 *
 *   node scripts/gource-log.mjs            real commit times
 *   node scripts/gource-log.mjs --evenly   one commit per "day", for pacing
 *
 * Why --evenly exists: Gource plays history on a calendar. Commits made
 * minutes apart flash by in a single frame. --evenly spaces them out IN THE
 * LOG FILE ONLY so each commit gets equal screen time. Your real git history
 * is never touched.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const evenly = process.argv.includes("--evenly");
const DAY = 86_400;

const raw = execFileSync(
  "git",
  ["log", "--reverse", "--no-renames", "--name-status", "--pretty=format:@%at|%an"],
  { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);

const lines = [];
let commitIndex = -1;
let startTime = 0;
let time = 0;
let author = "";

for (const line of raw.split("\n")) {
  if (line.startsWith("@")) {
    const [seconds, name] = line.slice(1).split("|");
    commitIndex += 1;
    if (commitIndex === 0) startTime = Number(seconds);
    time = evenly ? startTime + commitIndex * DAY : Number(seconds);
    author = name;
  } else if (line.trim()) {
    const [status, path] = line.split("\t");
    // Skip generated or huge files that would only add noise to the picture.
    if (path === "package-lock.json") continue;
    lines.push(`${time}|${author}|${status[0]}|${path}`);
  }
}

mkdirSync("gource", { recursive: true });
writeFileSync("gource/dj-crate.log", lines.join("\n") + "\n");
console.log(`Wrote gource/dj-crate.log: ${commitIndex + 1} commits, ${lines.length} file changes`);
