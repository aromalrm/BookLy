"use client";

import { useMemo, useState } from "react";
import { SECTION_LABELS, type Book } from "@/lib/types";

type Props = {
  books: Book[];
  onInspect: (book: Book) => void;
  onRead: (book: Book) => void;
};

export function Catalog({ books, onInspect, onRead }: Props) {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!trimmed) return books;
    const words = trimmed.split(/\s+/).filter(Boolean);
    return books.filter((book) => {
      const haystack = [book.title, book.authors, book.summary, book.spine, SECTION_LABELS[book.section]]
        .join(" ")
        .toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }, [books, trimmed]);

  return (
    <div className="catalog" data-testid="catalog">
      <label className="catalogSearch">
        <span>Search the library</span>
        <input
          data-testid="catalog-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Title, author, or subject"
          autoComplete="off"
        />
      </label>
      <p className="catalogCount">
        {results.length === 1 ? "1 book" : `${results.length} books`}
      </p>
      <ul className="catalogList">
        {results.map((book) => (
          <li key={book.id}>
            <article className="catalogRow">
              <button type="button" className="catalogMain" onClick={() => onInspect(book)}>
                {book.coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.coverUrl} alt="" />
                ) : (
                  <span className="catalogThumb" style={{ background: book.color.bg }} />
                )}
                <span>
                  <strong>{book.title}</strong>
                  <small>
                    {book.authors} · {SECTION_LABELS[book.section]}
                  </small>
                </span>
              </button>
              <button type="button" className="catalogRead" onClick={() => onRead(book)}>
                Read
              </button>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
