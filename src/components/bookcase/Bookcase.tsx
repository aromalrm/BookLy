"use client";

import type { Book, ShelfSection } from "@/lib/types";
import { SECTION_LABELS } from "@/lib/types";
import styles from "./bookcase.module.css";

type Bay = {
  id: ShelfSection;
  books: Book[];
};

type Props = {
  bays: Bay[];
  mode: "home" | "section";
  onOpenSection: (section: ShelfSection) => void;
  onOpenBook: (book: Book) => void;
};

function variation(id: string): number {
  let n = 0;
  for (const char of id) n = (n * 33 + char.charCodeAt(0)) % 997;
  return n;
}

function rowsOf(books: Book[], shelfCount: number): Book[][] {
  const rows: Book[][] = Array.from({ length: shelfCount }, () => []);
  books.forEach((book, index) => {
    rows[index % shelfCount].push(book);
  });
  return rows;
}

export function Bookcase({ bays, mode, onOpenSection, onOpenBook }: Props) {
  const shelfCount = mode === "home" ? 3 : 2;

  return (
    <div className={styles.room} data-testid="bookcase" data-mode={mode}>
      <div className={mode === "home" ? styles.case : styles.caseSection}>
        <div className={styles.cornice} />
        <div className={styles.bays}>
          {bays.map((bay) => (
            <section key={bay.id} className={styles.bay} data-testid={`bay-${bay.id}`}>
              {mode === "home" ? (
                <button
                  type="button"
                  className={styles.plaque}
                  data-testid={`section-${bay.id}`}
                  onClick={() => onOpenSection(bay.id)}
                >
                  {SECTION_LABELS[bay.id]}
                </button>
              ) : (
                <h2 className={styles.plaqueStatic}>{SECTION_LABELS[bay.id]}</h2>
              )}
              <div className={styles.shelves}>
                {rowsOf(bay.books, shelfCount).map((row, rowIndex) => (
                  <div className={styles.shelf} key={`${bay.id}-${rowIndex}`}>
                    <div className={styles.books}>
                      {row.map((book) => {
                        const n = variation(book.id);
                        const height = 90 + (n % 10);
                        const lean = ((n % 5) - 2) * 0.4;
                        return (
                          <button
                            key={book.id}
                            type="button"
                            className={styles.spine}
                            data-testid="case-spine"
                            data-book-id={book.id}
                            data-title={book.title}
                            aria-label={`${book.title}, ${book.authors}`}
                            style={{
                              height: `${height}%`,
                              background: book.color.bg,
                              color: book.color.fg,
                              transform: `rotate(${lean}deg)`,
                            }}
                            onClick={() => onOpenBook(book)}
                          >
                            <span className={styles.band} style={{ background: book.color.band }} />
                            <span className={styles.spineTitle}>{book.spine}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className={styles.plank} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className={styles.plinth} />
      </div>
    </div>
  );
}
