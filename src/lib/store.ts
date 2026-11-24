import { get, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { shortAuthor, spineText } from "./labels";
import { paletteFor } from "./palette";
import { SHELF_SEED_ID, seededShelf } from "./shelf-seed";
import type { Book, BookPatch, NewBookInput, ReadingStatus } from "./types";

/**
 * One person's library.
 * Locally this is data/library.json. On Vercel, where the disk is read-only,
 * the same JSON document lives in a private Blob store when
 * BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID is set.
 * Routes talk only to these functions, so either backend can be swapped.
 */

const DATA_PATH = path.join(process.cwd(), "data", "library.json");
const MARKER_PATH = path.join(process.cwd(), "data", ".shelf-seed");
const BLOB_PATH = "library.json";
const MARKER_BLOB = "shelf.seed";
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

function usesBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function parseBooks(raw: string): Book[] {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isBook).map((book) => ({
    ...book,
    summary: typeof book.summary === "string" ? book.summary : "",
  }));
}

async function readFileLibrary(): Promise<Book[]> {
  try {
    return parseBooks(await readFile(DATA_PATH, "utf8"));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }
}

async function readBlobLibrary(): Promise<Book[]> {
  const result = await get(BLOB_PATH, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return [];
  return parseBooks(await new Response(result.stream).text());
}

async function readAll(): Promise<Book[]> {
  return usesBlob() ? readBlobLibrary() : readFileLibrary();
}

async function readMarker(): Promise<string> {
  if (usesBlob()) {
    const result = await get(MARKER_BLOB, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200) return "";
    return (await new Response(result.stream).text()).trim();
  }
  try {
    return (await readFile(MARKER_PATH, "utf8")).trim();
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return "";
    throw error;
  }
}

async function writeMarker(id: string): Promise<void> {
  if (usesBlob()) {
    await put(MARKER_BLOB, id, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "text/plain",
    });
    return;
  }
  await mkdir(path.dirname(MARKER_PATH), { recursive: true });
  await writeFile(MARKER_PATH, id, "utf8");
}

async function writeFileLibrary(books: Book[]): Promise<void> {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  const temp = `${DATA_PATH}.tmp`;
  await writeFile(temp, JSON.stringify(books, null, 2), "utf8");
  await rename(temp, DATA_PATH);
}

async function writeBlobLibrary(books: Book[]): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(books, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

async function writeAll(books: Book[]): Promise<void> {
  if (usesBlob()) {
    await writeBlobLibrary(books);
    return;
  }
  await writeFileLibrary(books);
}

function byCreated(a: Book, b: Book): number {
  return a.createdAt.localeCompare(b.createdAt);
}

export async function listBooks(): Promise<Book[]> {
  return enqueue(async () => {
    if ((await readMarker()) !== SHELF_SEED_ID) {
      const seeded = seededShelf();
      await writeAll(seeded);
      await writeMarker(SHELF_SEED_ID);
      return seeded;
    }
    const books = await readAll();
    return books.sort(byCreated);
  });
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
    summary: "",
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
