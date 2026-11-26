"use client";

import { useState } from "react";
import { SpineImage } from "@/components/SpineImage";
import { SECTION_LABELS, type Book } from "@/lib/types";

type Face = "cover" | "spine" | "open";

const FACES: { id: Face; label: string }[] = [
  { id: "cover", label: "Cover" },
  { id: "spine", label: "Spine" },
  { id: "open", label: "Open" },
];

export function Inspector({ book }: { book: Book }) {
  const [face, setFace] = useState<Face>("cover");
  const [failed, setFailed] = useState(false);

  return (
    <div className="inspector" data-testid="inspector">
      <div className="inspectStage">
        <div className="faceTabs" role="tablist" aria-label="Book states">
          {FACES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={face === item.id}
              data-testid={`face-${item.id}`}
              onClick={() => setFace(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="faceFrame" data-face-view={face}>
          {face === "cover" ? (
            book.coverUrl && !failed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="inspectCover"
                data-testid="inspect-cover"
                src={book.coverUrl}
                alt=""
                onError={() => setFailed(true)}
              />
            ) : (
              <div className="inspectFallback" style={{ background: book.color.bg, color: book.color.fg }}>
                {book.title}
              </div>
            )
          ) : null}
          {face === "spine" ? (
            <div className="inspectSpine" data-testid="inspect-spine">
              <SpineImage src={book.coverUrl} />
              <span>{book.spine}</span>
            </div>
          ) : null}
          {face === "open" ? (
            <article className="parchment inspectLeaf" data-testid="inspect-open">
              <p className="kicker">{SECTION_LABELS[book.section]}</p>
              <h2 className="bookTitle">{book.title}</h2>
              <p className="byline">{book.authors}</p>
            </article>
          ) : null}
        </div>
      </div>
      <article className="parchment inspectCopy">
        <p className="kicker">{SECTION_LABELS[book.section]}</p>
        <h2 className="bookTitle">{book.title}</h2>
        <p className="byline">
          {book.authors}
          {book.year ? ` · ${book.year}` : ""}
        </p>
        {book.summary ? (
          <div className="summary" data-testid="summary">
            {book.summary.split(/\n\n+/).map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
        ) : null}
      </article>
    </div>
  );
}
