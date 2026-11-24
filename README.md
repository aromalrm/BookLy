# BookLy

A personal bookshelf for one library on this machine. There are no accounts.

Add a book by hand, or look one up by title or ISBN through the [Open Library](https://openlibrary.org/dev/docs/api/search) API. Covers come from Open Library too. Search the shelf, set a reading status and a percent, and keep a note on each book.

The shelf is one row of spines. Scrolling, dragging, or the arrow keys move along it. The centered book turns to show its cover. That motion lives in `src/components/bookshelf/Bookshelf.tsx`.

Books are stored in `data/library.json`, which is created on the first add and is not committed. The read and write functions are in `src/lib/store.ts`, so the file can be replaced with another store later.

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Title and ISBN lookup needs a network connection to Open Library. Adding a book by hand does not.
