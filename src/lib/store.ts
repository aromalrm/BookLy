import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { shortAuthor, spineText } from "./labels";
import { paletteFor } from "./palette";
import type { Book, BookPatch, NewBookInput, ReadingStatus } from "./types";

/**
 * One person's library, stored as JSON on this machine.
 * Routes talk only to these functions, so the file can be swapped
 * for SQLite or another store without changing the UI.
 */

const DATA_PATH = path.join(process.cwd(), "data", "library.json");
const STATUSES = new Set<ReadingStatus>(["unread", "reading", "finished"]);

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function isBook(value: unknown): value is Book {
  if (!value || typeof value !== "object") return false;
  const book = value as Partial<Book>;
  return (
    typeof book.id === "string" &&
    typeof book.title === "string" &&
    typeof book.authors === "string" &&
    typeof book.status === "string" &&
    STATUSES.has(book.status as ReadingStatus) &&
    typeof book.progress === "number" &&
    typeof book.notes === "string"
  );
}

async function readAll(): Promise<Book[]> {
  try {
    const raw = await readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBook);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }
}

async function writeAll(books: Book[]): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  const temp = `${DATA_PATH}.tmp`;
  await writeFile(temp, JSON.stringify(books, null, 2), "utf8");
  await rename(temp, DATA_PATH);
}

function byCreated(a: Book, b: Book): number {
  return a.createdAt.localeCompare(b.createdAt);
}

export async function listBooks(): Promise<Book[]> {
  const books = await readAll();
  return books.sort(byCreated);
}

function cleanCover(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "covers.openlibrary.org") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function cleanIsbn(value: string | null | undefined): string | null {
  if (!value) return null;
  const compact = value.replace(/[-\s]/g, "").toUpperCase();
  if (/^\d{13}$/.test(compact) || /^\d{9}[\dX]$/.test(compact)) return compact;
  return null;
}

export async function createBook(input: NewBookInput): Promise<Book> {
  const title = input.title.trim();
  if (!title || title.length > 300) {
    throw new Error("A title is required.");
  }
  const authors = (input.authors?.trim() || "Unknown author").slice(0, 300);
  const isbn = cleanIsbn(input.isbn);
  const year =
    typeof input.year === "number" && input.year > 0 && input.year < 2200
      ? Math.round(input.year)
      : null;
  const book: Book = {
    id: randomUUID(),
    title,
    authors,
    isbn,
    year,
    coverUrl:
      cleanCover(input.coverUrl) ??
      (isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg` : null),
    spine: spineText(title),
    authorShort: shortAuthor(authors),
    color: paletteFor(`${title}:${authors}`),
    aspect: 0.67,
    status: "unread",
    progress: 0,
    notes: "",
    createdAt: new Date().toISOString(),
  };
  return enqueue(async () => {
    const books = await readAll();
    books.push(book);
    await writeAll(books);
    return book;
  });
}

export async function updateBook(id: string, patch: BookPatch): Promise<Book | null> {
  return enqueue(async () => {
    const books = await readAll();
    const index = books.findIndex((book) => book.id === id);
    if (index < 0) return null;
    const current = books[index];
    const next: Book = { ...current };
    if (patch.status && STATUSES.has(patch.status)) next.status = patch.status;
    if (typeof patch.progress === "number" && Number.isFinite(patch.progress)) {
      next.progress = Math.max(0, Math.min(100, Math.round(patch.progress)));
    }
    if (typeof patch.notes === "string") next.notes = patch.notes.slice(0, 20000);
    books[index] = next;
    await writeAll(books);
    return next;
  });
}

export async function removeBook(id: string): Promise<boolean> {
  return enqueue(async () => {
    const books = await readAll();
    const next = books.filter((book) => book.id !== id);
    if (next.length === books.length) return false;
    await writeAll(next);
    return true;
  });
}
