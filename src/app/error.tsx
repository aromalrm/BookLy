"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="crash">
      <h2>The shelf didn’t open.</h2>
      <p>Something went wrong while reading the library.</p>
      <button className="primary" type="button" onClick={reset} style={{ marginTop: 16 }}>
        Try again
      </button>
    </div>
  );
}
