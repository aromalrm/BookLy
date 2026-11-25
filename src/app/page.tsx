import { LibraryApp } from "@/components/LibraryApp";
import { listBooks } from "@/lib/store";
import { isShelfSection, type ShelfSection } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; book?: string }>;
}) {
  const params = await searchParams;
  const books = await listBooks();
  const initialSection: ShelfSection | null = isShelfSection(params.section) ? params.section : null;
  return (
    <LibraryApp
      initialBooks={books}
      initialSection={initialSection}
      initialBookId={typeof params.book === "string" ? params.book : null}
    />
  );
}
