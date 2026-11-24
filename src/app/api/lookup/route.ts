import { lookupBooks } from "@/lib/open-library";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return Response.json({ results: [] });
  try {
    const results = await lookupBooks(query);
    return Response.json({ results });
  } catch (error) {
    console.error("Open Library lookup failed", error);
    return Response.json(
      { error: "The book lookup didn't respond. You can add the book by hand." },
      { status: 502 },
    );
  }
}
