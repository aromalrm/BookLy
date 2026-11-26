import { LibraryApp } from "@/components/LibraryApp";
import { listBooks } from "@/lib/store";

export const dynamic = "force-dynamic";

const VIEWS = ["hall", "catalog", "reading", "inspect", "turning"] as const;
type View = (typeof VIEWS)[number];

function viewOf(value: string | undefined): View {
  return VIEWS.includes(value as View) ? (value as View) : "hall";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; book?: string }>;
}) {
  const params = await searchParams;
  const books = await listBooks();
  return (
    <LibraryApp
      initialBooks={books}
      initialView={viewOf(params.view)}
      initialBookId={typeof params.book === "string" ? params.book : null}
    />
  );
}
