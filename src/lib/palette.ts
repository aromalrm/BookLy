import type { SpineColor } from "./types";

/** Warm, distinct spine colors. Covers still come from Open Library. */
const SPINES: SpineColor[] = [
  { bg: "#6B3A2A", fg: "#F8F1E7", band: "#E4C99A" },
  { bg: "#3E4C3A", fg: "#F4F0E6", band: "#D9C7A4" },
  { bg: "#2E3C48", fg: "#F3EEE6", band: "#D4C3A4" },
  { bg: "#734527", fg: "#FFF8EE", band: "#F0D7B0" },
  { bg: "#5A2E33", fg: "#F8F1E8", band: "#E7C8A4" },
  { bg: "#4A3C2A", fg: "#F6F0E6", band: "#E6D3B0" },
  { bg: "#2F3A34", fg: "#F3EEE4", band: "#D5C6A8" },
  { bg: "#7A5340", fg: "#FFF9F2", band: "#F3E0C4" },
  { bg: "#3A3044", fg: "#F6F1E8", band: "#D9CBB4" },
  { bg: "#8A6232", fg: "#FFF8EE", band: "#F6E3C4" },
];

export function paletteFor(seed: string): SpineColor {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return SPINES[hash % SPINES.length];
}
