"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { LookupHit, NewBookInput } from "@/lib/types";

type Props = {
  onClose: () => void;
  onCreate: (input: NewBookInput) => Promise<void>;
};

export function AddBookDialog({ onClose, onCreate }: Props) {
  const titleId = useId();
  const lookupRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"lookup" | "hand">("lookup");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LookupHit[]>([]);
  const [status, setStatus] = useState("");
  const [searching, setSearching] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [isbn, setIsbn] = useState("");
  const [handError, setHandError] = useState("");

  useEffect(() => {
    lookupRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function search(event?: React.FormEvent) {
    event?.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setStatus("Enter a title or ISBN.");
      setResults([]);
      return;
    }
    setSearching(true);
    setStatus("Searching Open Library…");
    try {
      const response = await fetch(`/api/lookup?q=${encodeURIComponent(trimmed)}`);
      const payload = (await response.json()) as { results?: LookupHit[]; error?: string };
      if (!response.ok) {
        setResults([]);
        setStatus(payload.error ?? "The lookup didn't respond.");
        return;
      }
      const next = payload.results ?? [];
      setResults(next);
      setStatus(next.length === 0 ? "No books found for that search." : "");
    } catch {
      setResults([]);
      setStatus("The lookup didn't respond. You can add the book by hand.");
    } finally {
      setSearching(false);
    }
  }

  async function addHit(hit: LookupHit) {
    setPending(hit.id);
    setStatus("");
    try {
      await onCreate({
        title: hit.title,
        authors: hit.authors,
        isbn: hit.isbn,
        year: hit.year,
        coverUrl: hit.coverUrl,
      });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Couldn't add that book.");
      setPending(null);
    }
  }

  async function addByHand(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setHandError("A title is required.");
      return;
    }
    setHandError("");
    setPending("hand");
    try {
      await onCreate({
        title,
        authors,
        isbn: isbn.trim() || null,
      });
    } catch (error) {
      setHandError(error instanceof Error ? error.message : "Couldn't add that book.");
      setPending(null);
    }
  }

  return (
    <div className="backdrop" data-block-shelf="" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="add-dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialogHead">
          <h2 id={titleId}>Add a book</h2>
          <button type="button" className="iconButton" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "lookup"}
            onClick={() => setTab("lookup")}
          >
            Title or ISBN
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "hand"}
            onClick={() => setTab("hand")}
          >
            By hand
          </button>
        </div>

        {tab === "lookup" ? (
          <form onSubmit={(event) => void search(event)}>
            <div className="lookupRow">
              <div className="row">
                <input
                  ref={lookupRef}
                  data-testid="lookup-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Title or ISBN"
                  aria-label="Title or ISBN"
                  autoComplete="off"
                />
                <button className="primary" type="submit" disabled={searching}>
                  {searching ? "Searching…" : "Search"}
                </button>
              </div>
            </div>
            <p className="message" aria-live="polite">
              {status}
            </p>
            <ul className="results" data-testid="lookup-results">
              {results.map((hit) => (
                <li key={`${hit.id}:${hit.isbn ?? hit.title}`}>
                  <button
                    type="button"
                    className="result"
                    onClick={() => void addHit(hit)}
                    disabled={pending !== null}
                  >
                    {hit.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={hit.coverUrl} alt="" />
                    ) : (
                      <span className="thumbFallback" />
                    )}
                    <span>
                      <strong>{hit.title}</strong>
                      <small>
                        {hit.authors}
                        {hit.year ? ` · ${hit.year}` : ""}
                      </small>
                    </span>
                    <em>{pending === hit.id ? "Adding…" : "Add"}</em>
                  </button>
                </li>
              ))}
            </ul>
          </form>
        ) : (
          <form className="handForm" onSubmit={(event) => void addByHand(event)}>
            <label className="field">
              <span>Title</span>
              <input
                data-testid="hand-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                autoComplete="off"
                required
              />
            </label>
            <label className="field">
              <span>Author</span>
              <input
                data-testid="hand-author"
                value={authors}
                onChange={(event) => setAuthors(event.target.value)}
                autoComplete="off"
              />
            </label>
            <label className="field">
              <span>ISBN, if you have it</span>
              <input
                data-testid="hand-isbn"
                value={isbn}
                onChange={(event) => setIsbn(event.target.value)}
                autoComplete="off"
              />
            </label>
            {handError ? <p className="errorText">{handError}</p> : null}
            <div className="actions">
              <button className="primary" type="submit" data-testid="hand-submit" disabled={pending === "hand"}>
                {pending === "hand" ? "Adding…" : "Add to shelf"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
