export type ReadingStatus = "unread" | "reading" | "finished";

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
  createdAt: string;
};

export type NewBookInput = {
  title: string;
  authors?: string;
  isbn?: string | null;
  year?: number | null;
  coverUrl?: string | null;
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
