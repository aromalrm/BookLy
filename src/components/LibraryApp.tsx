"use client";

import { useEffect, useMemo, useState } from "react";
import { AddBookDialog } from "@/components/AddBookDialog";
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
  type NewBookInput,
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

function matches(book: Book, query: string): boolean {
  if (!query) return true;
  const haystack = [
    book.title,
    book.authors,
    book.isbn ?? "",
    book.notes,
    book.summary,
    book.spine,
    SECTION_LABELS[book.section],
  ]
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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [adding, setAdding] = useState(false);
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
  const trimmedQuery = query.trim();

  const caseBooks = useMemo(
    () => books.filter((book) => matches(book, trimmedQuery)),
    [books, trimmedQuery],
  );

  const readingBooks = useMemo(() => {
    if (!selected) return [];
    return books.filter(
      (book) =>
        book.section === selected.section &&
        (book.id === selected.id ||
          ((filter === "all" || book.status === filter) && matches(book, trimmedQuery))),
    );
  }, [books, filter, selected, trimmedQuery]);

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
    books: caseBooks.filter((book) => book.section === id),
  }));

  const sectionBay = activeSection
    ? [{ id: activeSection, books: caseBooks.filter((book) => book.section === activeSection) }]
    : [];

  async function createBook(input: NewBookInput) {
    const response = await fetch("/api/library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error(await readError(response));
    const payload = (await response.json()) as { book: Book };
    setBooks((current) => [...current, payload.book]);
    setAdding(false);
    setQuery("");
    go(payload.book.section, payload.book.id);
  }

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

  const countLabel = selected
    ? SECTION_LABELS[selected.section]
    : activeSection
      ? `${sectionBay[0]?.books.length ?? 0} in ${SECTION_LABELS[activeSection]}`
      : books.length === 1
        ? "1 book"
        : `${books.length} books`;

  return (
    <>
      <div className="app">
        <header className="mast" inert={shelfOpen || adding ? true : undefined}>
          <div className="topbar">
            <div className="brand">
              <button type="button" className="logoButton" data-testid="nav-home" onClick={() => go(null, null)}>
                <span className="logo">BookLy</span>
              </button>
              <p className="count">{countLabel}</p>
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
          </div>
          <nav className="sectionNav" aria-label="Library sections">
            {SHELF_SECTIONS.map((id) => (
              <button
                key={id}
                type="button"
                data-testid={`nav-${id}`}
                data-on={activeSection === id}
                onClick={() => go(id, null)}
              >
                {SECTION_LABELS[id]}
              </button>
            ))}
          </nav>
        </header>
        <div className="workspace" inert={adding ? true : undefined}>
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
      {adding ? (
        <AddBookDialog onClose={() => setAdding(false)} onCreate={createBook} />
      ) : null}
    </>
  );
}
