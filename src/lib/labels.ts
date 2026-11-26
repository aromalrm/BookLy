export function spineText(title: string): string {
  const main = title.split(":")[0]?.trim() || title.trim();
  if (main.length <= 46) return main;
  return `${main.slice(0, 44).trimEnd()}…`;
}

export function shortAuthor(authors: string): string {
  const first = authors.split(/,| and | & /i)[0]?.trim() || "Unknown";
  if (first.includes(",")) return first.split(",")[0]?.trim() || first;
  const bits = first.split(/\s+/).filter(Boolean);
  return bits[bits.length - 1] || first;
}

export function shelfLabel(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function statusLine(
  authors: string,
  status: "unread" | "reading" | "finished",
  progress: number,
): string {
  const author = authors.trim() || "Unknown author";
  if (status === "finished") return `${author} · Finished`;
  if (status === "reading") return `${author} · Reading · ${progress}%`;
  return `${author} · Unread`;
}
