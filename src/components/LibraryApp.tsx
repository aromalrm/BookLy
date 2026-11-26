"use client";

import { useEffect, useMemo, useState } from "react";
import { BookPage } from "@/components/BookPage";
import { Bookcase } from "@/components/bookcase/Bookcase";
import { Bookshelf, type ShelfBook } from "@/components/bookshelf/Bookshelf";
import { Catalog } from "@/components/Catalog";
import { Inspector } from "@/components/Inspector";
import { shelfLabel, statusLine } from "@/lib/labels";
import { SHELF_SECTIONS, type Book, type BookPatch, type ShelfSection } from "@/lib/types";

type View = "hall" | "catalog" | "reading" | "inspect" | "turning";

const VIEWS: View[] = ["hall", "catalog", "reading", "inspect", "turning"];

function isView(value: string | null): value is View {
  return VIEWS.includes(value as View);
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
  initialView,
  initialBookId,
}: {
  initialBooks: Book[];
  initialView: View;
  initialBookId: string | null;
}) {
  const [books, setBooks] = useState(initialBooks);
  const [view, setView] = useState<View>(initialView);
  const [section, setSection] = useState<ShelfSection | null>(null);
  const [bookId, setBookId] = useState<string | null>(initialBookId);
  const [shelfOpen, setShelfOpen] = useState(false);

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("view");
      setView(isView(next) ? next : "hall");
      setBookId(params.get("book"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function go(nextView: View, nextBookId: string | null) {
    const params = new URLSearchParams();
    if (nextView !== "hall") params.set("view", nextView);
    if (nextBookId) params.set("book", nextBookId);
    const queryString = params.toString();
    window.history.pushState(null, "", queryString ? `/?${queryString}` : "/");
    setView(nextView);
    setBookId(nextBookId);
    if (nextView === "hall") setSection(null);
  }

  const order = useMemo(() => new Map(books.map((book, index) => [book.id, index])), [books]);
  const selected = books.find((book) => book.id === bookId) ?? null;
  const shelfSource = selected
    ? books.filter((book) => book.section === selected.section)
    : [];

  const shelfBooks: ShelfBook[] = shelfSource.map((book) => ({
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

  const sectionBay = section
    ? [{ id: section, books: books.filter((book) => book.section === section) }]
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
    setBooks((current) => current.filter((book) => book.id !== id));
    if (bookId === id) go("hall", null);
    const response = await fetch(`/api/library/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setBooks(previous);
      throw new Error(await readError(response));
    }
  }

  function renderOpen(id: string, close: () => void) {
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
  }

  const hall = view === "hall" || (view === "turning" && !selected);

  return (
    <div className="app">
      <header className="mast" inert={shelfOpen ? true : undefined}>
        <button type="button" className="logoButton" data-testid="nav-home" onClick={() => go("hall", null)}>
          <span className="logo">BookLy</span>
        </button>
        <nav className="goldNav" aria-label="Library">
          <button type="button" data-testid="nav-hall" data-on={view === "hall" || view === "turning"} onClick={() => go("hall", null)}>
            Hall
          </button>
          <button type="button" data-testid="nav-catalog" data-on={view === "catalog"} onClick={() => go("catalog", bookId)}>
            Catalog
          </button>
          {selected ? (
            <>
              <button
                type="button"
                data-testid="nav-reading"
                data-on={view === "reading"}
                onClick={() => go("reading", selected.id)}
              >
                Reading
              </button>
              <button
                type="button"
                data-testid="nav-inspect"
                data-on={view === "inspect"}
                onClick={() => go("inspect", selected.id)}
              >
                Inspector
              </button>
            </>
          ) : null}
        </nav>
      </header>
      <div className="workspace">
        {view === "turning" && selected ? (
          <Bookshelf
            key={selected.id}
            autoOpen
            books={shelfBooks}
            focusId={selected.id}
            emptyTitle="The shelf is empty"
            emptyBody="This section has no books."
            onOpenChange={setShelfOpen}
            renderBook={renderOpen}
          />
        ) : null}
        {view === "reading" && selected ? (
          renderOpen(selected.id, () => go("hall", null))
        ) : null}
        {view === "inspect" && selected ? <Inspector book={selected} /> : null}
        {view === "catalog" ? (
          <Catalog
            books={books}
            onInspect={(book) => go("inspect", book.id)}
            onRead={(book) => go("turning", book.id)}
          />
        ) : null}
        {hall && section ? (
          <Bookcase
            mode="section"
            bays={sectionBay}
            onOpenSection={(id) => setSection(id)}
            onOpenBook={(book) => go("turning", book.id)}
          />
        ) : null}
        {hall && !section ? (
          <Bookcase
            mode="home"
            bays={homeBays}
            onOpenSection={(id) => setSection(id)}
            onOpenBook={(book) => go("turning", book.id)}
          />
        ) : null}
      </div>
    </div>
  );
}

export type { View };
