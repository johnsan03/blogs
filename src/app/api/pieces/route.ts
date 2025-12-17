import { NextResponse } from "next/server";
import { getAllPieces, savePiece, type SavePieceInput } from "@/lib/pieces";

export async function GET() {
  const pieces = await getAllPieces();
  return NextResponse.json({ pieces });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input = body as Partial<SavePieceInput>;
  if (
    !input ||
    typeof input.title !== "string" ||
    typeof input.type !== "string" ||
    typeof input.content !== "string"
  ) {
    return NextResponse.json(
      { error: "Missing fields: title, type, content" },
      { status: 400 },
    );
  }

  if (!["blog", "short-story", "poem"].includes(input.type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const { slug } = await savePiece({
    title: input.title,
    author: typeof input.author === "string" ? input.author : undefined,
    type: input.type as SavePieceInput["type"],
    tags: Array.isArray(input.tags)
      ? input.tags.filter((t) => typeof t === "string")
      : [],
    content: input.content,
  });

  return NextResponse.json({ slug }, { status: 201 });
}


