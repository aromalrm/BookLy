"use client";

import { useMemo, useState } from "react";
import { AddBookDialog } from "@/components/AddBookDialog";
import { BookPage } from "@/components/BookPage";
import { Bookshelf, type ShelfBook } from "@/components/bookshelf/Bookshelf";
import { shelfLabel, statusLine } from "@/lib/labels";
import type { Book, BookPatch, NewBookInput, ReadingStatus } from "@/lib/types";

type StatusFilter = "all" | ReadingStatus;

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "reading", label: "Reading" },
  { id: "finished", label: "Finished" },
];

function matches(book: Book, query: string): boolean {
  if (!query) return true;
  const haystack = [book.title, book.authors, book.isbn ?? "", book.notes, book.spine]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

async function readError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error || "The shelf couldn't save that.";
  } catch {
    return "The shelf couldn't save that.";
  }
}

export function LibraryApp({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState(initialBooks);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [adding, setAdding] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [shelfOpen, setShelfOpen] = useState(false);

  const order = useMemo(() => new Map(books.map((book, index) => [book.id, index])), [books]);

  const visible = useMemo(
    () =>
      books.filter(
        (book) => (filter === "all" || book.status === filter) && matches(book, query.trim()),
      ),
    [books, filter, query],
  );

  const shelfBooks: ShelfBook[] = visible.map((book) => ({
    id: book.id,
    title: book.title,
    authors: book.authors,
    spine: book.spine,
    authorShort: book.authorShort,
    coverUrl: book.coverUrl,
    bg: book.color.bg,
    fg: book.color.fg,
    band: book.color.band,
    aspect: book.aspect,
    label: shelfLabel(order.get(book.id) ?? 0),
    meta: statusLine(book.authors, book.status, book.progress),
  }));

  const emptyLibrary = books.length === 0;
  const emptyTitle = emptyLibrary ? "Your shelf is empty" : "Nothing matches";
  const emptyBody = emptyLibrary
    ? "Add a book by title, ISBN, or by hand. It will stand here."
    : "No book on the shelf fits that search.";

  async function createBook(input: NewBookInput) {
    const response = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error(await readError(response));
    const payload = (await response.json()) as { book: Book };
    setBooks((current) => [...current, payload.book]);
    setQuery("");
    setFilter("all");
    setFocusId(payload.book.id);
    setAdding(false);
  }

  async function updateBook(id: string, patch: BookPatch) {
    const previous = books;
    setBooks((current) =>
      current.map((book) => (book.id === id ? { ...book, ...patch } : book)),
    );
    const response = await fetch(`/api/library/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      setBooks(previous);
      throw new Error(await readError(response));
    }
    const payload = (await response.json()) as { book: Book };
    setBooks((current) => current.map((book) => (book.id === id ? payload.book : book)));
  }

  async function removeBook(id: string) {
    const previous = books;
    setBooks((current) => current.filter((book) => book.id !== id));
    const response = await fetch(`/api/library/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setBooks(previous);
      throw new Error(await readError(response));
    }
  }

  const counts = {
    all: books.length,
    unread: books.filter((book) => book.status === "unread").length,
    reading: books.filter((book) => book.status === "reading").length,
    finished: books.filter((book) => book.status === "finished").length,
  };

  return (
    <>
      <div className="app">
        <header className="topbar" inert={shelfOpen || adding ? true : undefined}>
          <div className="brand">
            <h1 className="logo">BookLy</h1>
            <p className="count">
              {books.length === 1 ? "1 book" : `${books.length} books`}
            </p>
          </div>
          <label className="search">
            <span className="srOnly">Search your shelf</span>
            <input
              data-testid="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search your shelf"
              autoComplete="off"
            />
            {query ? (
              <button type="button" className="clearSearch" onClick={() => setQuery("")}>
                Clear
              </button>
            ) : null}
          </label>
          <button
            type="button"
            className="addButton"
            data-testid="add-book"
            onClick={() => setAdding(true)}
          >
            Add a book
          </button>
        </header>
        <div className="workspace" inert={adding ? true : undefined}>
          <div className="filters" inert={shelfOpen ? true : undefined}>
            <div className="pills" role="group" aria-label="Filter by status">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-on={filter === item.id}
                  onClick={() => setFilter(item.id)}
                >
                  {item.label} {counts[item.id]}
                </button>
              ))}
            </div>
          </div>
          <Bookshelf
            books={shelfBooks}
            focusId={focusId}
            emptyTitle={emptyTitle}
            emptyBody={emptyBody}
            onOpenChange={setShelfOpen}
            renderBook={(id, close) => {
              const book = books.find((item) => item.id === id);
              if (!book) return null;
              return (
                <BookPage
                  key={book.id}
                  book={book}
                  onUpdate={(patch) => updateBook(book.id, patch)}
                  onRemove={async () => {
                    await removeBook(book.id);
                    close();
                  }}
                />
              );
            }}
          />
        </div>
      </div>
      {adding ? (
        <AddBookDialog onClose={() => setAdding(false)} onCreate={createBook} />
      ) : null}
    </>
  );
}
