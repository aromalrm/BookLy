"use client";

import { useEffect, useMemo, useState } from "react";
import { BookPage } from "@/components/BookPage";
import { Bookcase } from "@/components/bookcase/Bookcase";
import { Bookshelf, type ShelfBook } from "@/components/bookshelf/Bookshelf";
import { shelfLabel, statusLine } from "@/lib/labels";
import {
  isShelfSection,
  SECTION_LABELS,
  SHELF_SECTIONS,
  type Book,
  type BookPatch,
  type ReadingStatus,
  type ShelfSection,
} from "@/lib/types";

type StatusFilter = "all" | ReadingStatus;

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "reading", label: "Reading" },
  { id: "finished", label: "Finished" },
];

async function readError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: string };
    return payload.error || "The shelf couldn't save that.";
  } catch {
    return "The shelf couldn't save that.";
  }
}

export function LibraryApp({
  initialBooks,
  initialSection,
  initialBookId,
}: {
  initialBooks: Book[];
  initialSection: ShelfSection | null;
  initialBookId: string | null;
}) {
  const [books, setBooks] = useState(initialBooks);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [section, setSection] = useState<ShelfSection | null>(initialSection);
  const [bookId, setBookId] = useState<string | null>(initialBookId);
  const [shelfOpen, setShelfOpen] = useState(false);

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const nextSection = params.get("section");
      setSection(isShelfSection(nextSection) ? nextSection : null);
      setBookId(params.get("book"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function go(nextSection: ShelfSection | null, nextBookId: string | null) {
    const params = new URLSearchParams();
    if (nextSection) params.set("section", nextSection);
    if (nextBookId) params.set("book", nextBookId);
    const queryString = params.toString();
    window.history.pushState(null, "", queryString ? `/?${queryString}` : "/");
    setSection(nextSection);
    setBookId(nextBookId);
  }

  const order = useMemo(() => new Map(books.map((book, index) => [book.id, index])), [books]);
  const selected = books.find((book) => book.id === bookId) ?? null;
  const activeSection = selected?.section ?? section;

  const readingBooks = useMemo(() => {
    if (!selected) return [];
    return books.filter(
      (book) =>
        book.section === selected.section &&
        (book.id === selected.id || filter === "all" || book.status === filter),
    );
  }, [books, filter, selected]);

  const shelfBooks: ShelfBook[] = readingBooks.map((book) => ({
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

  const homeBays = SHELF_SECTIONS.map((id) => ({
    id,
    books: books.filter((book) => book.section === id),
  }));

  const sectionBay = activeSection
    ? [{ id: activeSection, books: books.filter((book) => book.section === activeSection) }]
    : [];

  async function updateBook(id: string, patch: BookPatch) {
    const previous = books;
    setBooks((current) => current.map((book) => (book.id === id ? { ...book, ...patch } : book)));
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
    const removed = books.find((book) => book.id === id);
    setBooks((current) => current.filter((book) => book.id !== id));
    if (bookId === id) go(removed?.section ?? section, null);
    const response = await fetch(`/api/library/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setBooks(previous);
      throw new Error(await readError(response));
    }
  }

  const counts = {
    all: readingBooks.length,
    unread: readingBooks.filter((book) => book.status === "unread").length,
    reading: readingBooks.filter((book) => book.status === "reading").length,
    finished: readingBooks.filter((book) => book.status === "finished").length,
  };

  return (
    <>
      <div className="app">
        <header className="mast" inert={shelfOpen ? true : undefined}>
          <button type="button" className="logoButton" data-testid="nav-home" onClick={() => go(null, null)}>
            <span className="logo">BookLy</span>
          </button>
        </header>
        <div className="workspace">
          {selected ? (
            <>
              <div className="filters" inert={shelfOpen ? true : undefined}>
                <button
                  type="button"
                  className="ghost backButton"
                  data-testid="back-to-section"
                  onClick={() => go(selected.section, null)}
                >
                  Back to {SECTION_LABELS[selected.section]}
                </button>
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
                key={selected.id}
                books={shelfBooks}
                focusId={selected.id}
                emptyTitle="Nothing matches"
                emptyBody="No book in this section fits that search."
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
            </>
          ) : activeSection ? (
            <>
              <p className="sectionHint">Choose a book. It stays on the shelf until you do.</p>
              <Bookcase
                mode="section"
                bays={sectionBay}
                onOpenSection={(id) => go(id, null)}
                onOpenBook={(book) => go(book.section, book.id)}
              />
            </>
          ) : (
            <Bookcase
              mode="home"
              bays={homeBays}
              onOpenSection={(id) => go(id, null)}
              onOpenBook={(book) => go(book.section, book.id)}
            />
          )}
        </div>
      </div>
    </>
  );
}
