import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export type PieceType = "blog" | "short-story" | "poem";

export type PieceFrontmatter = {
  title: string;
  author?: string;
  type: PieceType;
  tags?: string[];
  createdAt: string; // ISO
};

export type PieceListItem = PieceFrontmatter & {
  slug: string;
  excerpt: string;
};

export type Piece = PieceFrontmatter & {
  slug: string;
  content: string;
  html: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content");
const XANO_CONTENT_POST_URL =
  process.env.XANO_CONTENT_POST_URL ??
  "https://x8ki-letl-twmt.n7.xano.io/api:WpZv-jLF/content_post";

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function ensureContentDir() {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
}

function normalizeFrontmatter(
  slug: string,
  data: Record<string, unknown>,
): PieceFrontmatter {
  const title = typeof data.title === "string" ? data.title : slug;
  const author = typeof data.author === "string" ? data.author : undefined;
  const type = (data.type as PieceType) ?? "blog";
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t) => typeof t === "string")
    : [];
  const createdAt =
    typeof data.createdAt === "string"
      ? data.createdAt
      : new Date().toISOString();

  return { title, author, type, tags, createdAt };
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

export async function getAllPieces(): Promise<PieceListItem[]> {
  // Prefer Xano when configured (or when using the default URL).
  // If the endpoint is unreachable, fall back to local files so the app still works offline.
  try {
    const res = await fetch(XANO_CONTENT_POST_URL, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as unknown;
      if (Array.isArray(data)) {
        const pieces = data
          .map((row) => {
            const r = row as Record<string, unknown>;
            const slug =
              typeof r.slug === "string"
                ? r.slug
                : typeof r.id === "number"
                  ? String(r.id)
                  : typeof r.id === "string"
                    ? r.id
                    : "";
            if (!slug) return null;

            const title = typeof r.title === "string" ? r.title : slug;
            const author =
              typeof r.writer_name === "string"
                ? r.writer_name
                : typeof r.author === "string"
                  ? r.author
                  : undefined;
            const type = (r.type as PieceType) ?? "blog";
            const tags = Array.isArray(r.tags)
              ? r.tags.filter((t) => typeof t === "string")
              : [];
            const createdAt =
              typeof r.createdAt === "string"
                ? r.createdAt
                : new Date().toISOString();

            const content =
              typeof r.content === "string" ? r.content : (r.body as string) ?? "";

            return {
              slug,
              title,
              author,
              type,
              tags,
              createdAt,
              excerpt: excerptFromMarkdown(content ?? ""),
            } satisfies PieceListItem;
          })
          .filter(Boolean) as PieceListItem[];

        return pieces.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      }
    }
  } catch {
    // Fall back to local content below.
  }

  await ensureContentDir();
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  const mdFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith(".md"))
    .map((e) => e.name);

  const pieces = await Promise.all(
    mdFiles.map(async (file) => {
      const slug = file.replace(/\.md$/, "");
      const raw = await fs.readFile(path.join(CONTENT_DIR, file), "utf8");
      const parsed = matter(raw);
      const fm = normalizeFrontmatter(slug, parsed.data);
      return {
        slug,
        ...fm,
        excerpt: excerptFromMarkdown(parsed.content),
      } satisfies PieceListItem;
    }),
  );

  return pieces.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getPieceBySlug(slug: string): Promise<Piece | null> {
  // Try Xano first.
  try {
    const all = await getAllPieces();
    const match = all.find((p) => p.slug === slug);
    if (match) {
      // Re-fetch full content from Xano (if present in list) by scanning the same endpoint.
      // Many small apps can live with this; if Xano provides a single-item endpoint later, switch to that.
      const res = await fetch(XANO_CONTENT_POST_URL, { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as unknown;
        if (Array.isArray(data)) {
          const row = data.find((x) => {
            const r = x as Record<string, unknown>;
            const rowSlug =
              typeof r.slug === "string"
                ? r.slug
                : typeof r.id === "number"
                  ? String(r.id)
                  : typeof r.id === "string"
                    ? r.id
                    : "";
            return rowSlug === slug;
          }) as Record<string, unknown> | undefined;

          if (row) {
            const title = typeof row.title === "string" ? row.title : slug;
            const author =
              typeof row.writer_name === "string"
                ? row.writer_name
                : typeof row.author === "string"
                  ? row.author
                  : undefined;
            const type = (row.type as PieceType) ?? "blog";
            const tags = Array.isArray(row.tags)
              ? row.tags.filter((t) => typeof t === "string")
              : [];
            const createdAt =
              typeof row.createdAt === "string"
                ? row.createdAt
                : new Date().toISOString();
            const content =
              typeof row.content === "string"
                ? row.content
                : typeof row.body === "string"
                  ? row.body
                  : "";

            const html = String(
              await remark().use(remarkGfm).use(remarkHtml).process(content),
            );

            return {
              slug,
              title,
              author,
              type,
              tags,
              createdAt,
              content,
              html,
            };
          }
        }
      }
    }
  } catch {
    // Fall back to local content below.
  }

  await ensureContentDir();
  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const parsed = matter(raw);
  const fm = normalizeFrontmatter(slug, parsed.data);
  const html = String(
    await remark().use(remarkGfm).use(remarkHtml).process(parsed.content),
  );

  return {
    slug,
    ...fm,
    content: parsed.content,
    html,
  };
}

export type SavePieceInput = {
  title: string;
  author?: string;
  type: PieceType;
  tags?: string[];
  content: string;
};

export async function savePiece(input: SavePieceInput): Promise<{ slug: string }> {
  // Try Xano first (remote DB).
  try {
    const nowIso = new Date().toISOString();
    const title = input.title.trim() || "Untitled";
    const slug = slugify(title || "untitled") || "untitled";

    const payload = {
      title,
      writer_name: input.author?.trim() || undefined,
      type: input.type,
      tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
      createdAt: nowIso,
      slug,
      content: input.content.trim(),
    };

    const res = await fetch(XANO_CONTENT_POST_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
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
  } catch {
    // Fall back to local content below.
  }

  await ensureContentDir();
  const title = input.title.trim();
  const nowIso = new Date().toISOString();
  const baseSlug = slugify(title || "untitled");

  const fileNames = await fs.readdir(CONTENT_DIR);
  const existing = new Set(fileNames.filter((f) => f.endsWith(".md")));
  let slug = baseSlug || "untitled";
  let attempt = 1;
  while (existing.has(`${slug}.md`)) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const frontmatter: PieceFrontmatter = {
    title: title || "Untitled",
    author: input.author?.trim() || undefined,
    type: input.type,
    tags: (input.tags ?? []).map((t) => t.trim()).filter(Boolean),
    createdAt: nowIso,
  };

  const fileBody = matter.stringify(input.content.trim() + "\n", frontmatter);
  await fs.writeFile(path.join(CONTENT_DIR, `${slug}.md`), fileBody, "utf8");

  return { slug };
}


