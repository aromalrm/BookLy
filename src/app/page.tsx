import { LibraryApp } from "@/components/LibraryApp";
import { listBooks } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const books = await listBooks();
  return <LibraryApp initialBooks={books} />;
}
