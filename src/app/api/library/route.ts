import { createBook, listBooks } from "@/lib/store";
import type { NewBookInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const books = await listBooks();
  return Response.json({ books });
}

export async function POST(request: Request) {
  let body: NewBookInput;
  try {
    body = (await request.json()) as NewBookInput;
  } catch {
    return Response.json({ error: "The request was not valid JSON." }, { status: 400 });
  }
  if (!body || typeof body.title !== "string") {
    return Response.json({ error: "A title is required." }, { status: 400 });
  }
  try {
    const book = await createBook(body);
    return Response.json({ book }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Couldn't add that book.";
    return Response.json({ error: message }, { status: 400 });
  }
}
