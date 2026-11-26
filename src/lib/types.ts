export type ReadingStatus = "unread" | "reading" | "finished";

export const SHELF_SECTIONS = ["fiction", "nonfiction", "psychology", "philosophy"] as const;

export type ShelfSection = (typeof SHELF_SECTIONS)[number];

export const SECTION_LABELS: Record<ShelfSection, string> = {
  fiction: "Fiction",
  nonfiction: "Non-fiction",
  psychology: "Psychology",
  philosophy: "Philosophy",
};

export function isShelfSection(value: unknown): value is ShelfSection {
  return typeof value === "string" && (SHELF_SECTIONS as readonly string[]).includes(value);
}

export type SpineColor = {
  bg: string;
  fg: string;
  band: string;
};

export type Book = {
  id: string;
  title: string;
  authors: string;
  isbn: string | null;
  year: number | null;
  coverUrl: string | null;
  spine: string;
  authorShort: string;
  color: SpineColor;
  aspect: number;
  status: ReadingStatus;
  progress: number;
  notes: string;
  summary: string;
  section: ShelfSection;
  createdAt: string;
};

export type NewBookInput = {
  title: string;
  authors?: string;
  isbn?: string | null;
  year?: number | null;
  coverUrl?: string | null;
  section?: ShelfSection;
};

export type BookPatch = {
  status?: ReadingStatus;
  progress?: number;
  notes?: string;
};

export type LookupHit = {
  id: string;
  title: string;
  authors: string;
  isbn: string | null;
  year: number | null;
  coverUrl: string | null;
};
