import { removeBook, updateBook } from "@/lib/store";
import type { BookPatch, ReadingStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set<ReadingStatus>(["unread", "reading", "finished"]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let body: BookPatch;
  try {
    body = (await request.json()) as BookPatch;
  } catch {
    return Response.json({ error: "The request was not valid JSON." }, { status: 400 });
  }
  const patch: BookPatch = {};
  if (body.status !== undefined) {
    if (!STATUSES.has(body.status)) {
      return Response.json({ error: "Unknown reading status." }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.progress !== undefined) {
    if (typeof body.progress !== "number" || !Number.isFinite(body.progress)) {
      return Response.json({ error: "Progress must be a number." }, { status: 400 });
    }
    patch.progress = body.progress;
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== "string") {
      return Response.json({ error: "Notes must be text." }, { status: 400 });
    }
    patch.notes = body.notes;
  }
  const book = await updateBook(id, patch);
  if (!book) return Response.json({ error: "That book is not on the shelf." }, { status: 404 });
  return Response.json({ book });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const removed = await removeBook(id);
  if (!removed) return Response.json({ error: "That book is not on the shelf." }, { status: 404 });
  return Response.json({ ok: true });
}
