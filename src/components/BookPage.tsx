"use client";

import { useState } from "react";
import { SECTION_LABELS, type Book, type BookPatch, type ReadingStatus } from "@/lib/types";

const STATUSES: { id: ReadingStatus; label: string }[] = [
  { id: "unread", label: "Unread" },
  { id: "reading", label: "Reading" },
  { id: "finished", label: "Finished" },
];

type Props = {
  book: Book;
  onUpdate: (patch: BookPatch) => Promise<void>;
  onRemove: () => Promise<void>;
};

export function BookPage({ book, onUpdate, onRemove }: Props) {
  const [status, setStatus] = useState(book.status);
  const [progress, setProgress] = useState(book.progress);
  const [notes, setNotes] = useState(book.notes);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function commit(patch: BookPatch) {
    setError(null);
    try {
      await onUpdate(patch);
    } catch {
      setError("Couldn't save that change.");
    }
  }

  function publishProgress(value: number) {
    const nextStatus: ReadingStatus =
      value >= 100 ? "finished" : value <= 0 ? "unread" : "reading";
    setProgress(value);
    setStatus(nextStatus);
    void commit({ progress: value, status: nextStatus });
  }

  function chooseStatus(next: ReadingStatus) {
    let nextProgress = progress;
    if (next === "unread") nextProgress = 0;
    if (next === "finished") nextProgress = 100;
    if (next === "reading" && (progress === 0 || progress === 100)) {
      nextProgress = progress === 100 ? 90 : 8;
    }
    setStatus(next);
    setProgress(nextProgress);
    void commit({ status: next, progress: nextProgress });
  }

  async function saveNote() {
    setSavingNote(true);
    setNoteSaved(false);
    setError(null);
    try {
      await onUpdate({ notes });
      setNoteSaved(true);
    } catch {
      setError("Couldn't save that note.");
    } finally {
      setSavingNote(false);
    }
  }

  async function remove() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setError(null);
    try {
      await onRemove();
    } catch {
      setError("Couldn't remove that book.");
      setConfirming(false);
    }
  }

  const dirty = notes !== book.notes;

  return (
    <div className="reading" data-testid="reading">
      <article className="parchment">
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
        ) : (
          <p className="byline">This book has no summary yet.</p>
        )}
      </article>
      <aside className="desk" aria-label="Notes and progress">
        <p className="deskLabel">Status</p>
        <div className="statusRow" role="group" aria-label="Reading status">
          {STATUSES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={status === item.id}
              data-status={item.id}
              onClick={() => chooseStatus(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="progressBlock">
          <span className="progressHead">
            <span>Progress</span>
            <span>{progress}%</span>
          </span>
          <input
            data-testid="progress"
            type="range"
            min={0}
            max={100}
            step={1}
            value={progress}
            aria-valuetext={`${progress} percent`}
            onInput={(event) => {
              const value = Number(event.currentTarget.value);
              setProgress(value);
              setStatus(value >= 100 ? "finished" : value <= 0 ? "unread" : "reading");
            }}
            onPointerUp={(event) => publishProgress(Number(event.currentTarget.value))}
            onKeyUp={(event) => publishProgress(Number(event.currentTarget.value))}
            onBlur={(event) => publishProgress(Number(event.currentTarget.value))}
          />
        </label>
        <div className="notesBlock">
          <label htmlFor="book-note">Notes</label>
          <textarea
            id="book-note"
            data-testid="note"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value);
              setNoteSaved(false);
              setConfirming(false);
            }}
          />
          <div className="actions">
            <button
              className="primary"
              type="button"
              data-testid="save-note"
              onClick={() => void saveNote()}
              disabled={!dirty || savingNote}
            >
              {savingNote ? "Saving…" : noteSaved && !dirty ? "Saved" : "Save note"}
            </button>
            <button className="danger" type="button" onClick={() => void remove()}>
              {confirming ? "Remove this book" : "Remove"}
            </button>
          </div>
        </div>
        {error ? <p className="errorText">{error}</p> : null}
      </aside>
    </div>
  );
}
