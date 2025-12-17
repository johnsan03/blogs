export type PieceType = "blog" | "short-story" | "poem";

export type XanoPiece = {
  id?: number | string;
  slug?: string;
  title?: string;
  writer_name?: string;
  type?: PieceType;
  tags?: string[];
  createdAt?: string;
  content?: string;
};

export type PieceListItem = {
  slug: string;
  title: string;
  author?: string;
  type: PieceType;
  tags: string[];
  createdAt: string;
  excerpt: string;
};

export type Piece = PieceListItem & {
  content: string;
};

const DEFAULT_URL =
  "https://x8ki-letl-twmt.n7.xano.io/api:WpZv-jLF/content_post";

export function getXanoUrl() {
  return process.env.NEXT_PUBLIC_XANO_CONTENT_POST_URL ?? DEFAULT_URL;
}

function excerptFromMarkdown(md: string) {
  const text = md
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_`]/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 180);
}

function normalizeSlug(row: XanoPiece) {
  if (typeof row.slug === "string" && row.slug) return row.slug;
  if (typeof row.id === "number") return String(row.id);
  if (typeof row.id === "string" && row.id) return row.id;
  return "";
}

export async function fetchAllPieces(): Promise<PieceListItem[]> {
  const res = await fetch(getXanoUrl(), { cache: "no-store" });
  const data = (await res.json()) as unknown;
  if (!res.ok || !Array.isArray(data)) return [];

  const pieces = (data as XanoPiece[])
    .map((row) => {
      const slug = normalizeSlug(row);
      if (!slug) return null;
      const title = typeof row.title === "string" ? row.title : slug;
      const author =
        typeof row.writer_name === "string" ? row.writer_name : undefined;
      const type = row.type ?? "blog";
      const tags = Array.isArray(row.tags) ? row.tags : [];
      const createdAt = row.createdAt ?? new Date().toISOString();
      const content = row.content ?? "";

      return {
        slug,
        title,
        author,
        type,
        tags,
        createdAt,
        excerpt: excerptFromMarkdown(content),
      } satisfies PieceListItem;
    })
    .filter(Boolean) as PieceListItem[];

  return pieces.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function fetchPieceBySlug(slug: string): Promise<Piece | null> {
  const all = await fetchAllPieces();
  const listMatch = all.find((p) => p.slug === slug);
  if (!listMatch) return null;

  // Re-fetch full list and locate content (simple, Pages-friendly).
  const res = await fetch(getXanoUrl(), { cache: "no-store" });
  const data = (await res.json()) as unknown;
  if (!res.ok || !Array.isArray(data)) return null;
  const row = (data as XanoPiece[]).find((r) => normalizeSlug(r) === slug);
  const content = row?.content ?? "";

  return { ...listMatch, content };
}

export type CreatePieceInput = {
  title: string;
  writer_name: string;
  type: PieceType;
  tags: string[];
  content: string;
};

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function createPiece(input: CreatePieceInput): Promise<{ slug: string }> {
  const createdAt = new Date().toISOString();
  const slug = slugify(input.title || "untitled") || "untitled";

  const payload = {
    title: input.title,
    writer_name: input.writer_name,
    type: input.type,
    tags: input.tags,
    createdAt,
    slug,
    content: input.content,
  };

  const res = await fetch(getXanoUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Publish failed");
  }

  const returnedSlug =
    typeof data.slug === "string"
      ? data.slug
      : typeof data.id === "number"
        ? String(data.id)
        : typeof data.id === "string"
          ? data.id
          : slug;

  return { slug: returnedSlug };
}


