import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchAllPieces } from "@/lib/xanoClient";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export async function generateStaticParams() {
  // Required for `output: "export"` so Next can pre-render each /p/[slug] page.
  const pieces = await fetchAllPieces();
  return pieces.map((p) => ({ slug: p.slug }));
}

async function fetchXanoRaw() {
  const url =
    process.env.XANO_CONTENT_POST_URL ??
    process.env.NEXT_PUBLIC_XANO_CONTENT_POST_URL ??
    "https://x8ki-letl-twmt.n7.xano.io/api:WpZv-jLF/content_post";
  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json()) as unknown;
  return { ok: res.ok, data };
}

export default async function PiecePage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;
  const pieces = await fetchAllPieces();
  const listMatch = pieces.find((p) => p.slug === slug);
  if (!listMatch) notFound();

  const { ok, data } = await fetchXanoRaw();
  if (!ok || !Array.isArray(data)) notFound();

  const row = (data as Array<Record<string, unknown>>).find((r) => {
    const rowSlug =
      typeof r.slug === "string"
        ? r.slug
        : typeof r.id === "number"
          ? String(r.id)
          : typeof r.id === "string"
            ? r.id
            : "";
    return rowSlug === slug;
  });
  if (!row) notFound();

  const content =
    typeof row.content === "string"
      ? row.content
      : typeof row.body === "string"
        ? row.body
        : "";

  const html = String(
    await remark().use(remarkGfm).use(remarkHtml).process(content),
  );

  const typeLabel =
    listMatch.type === "short-story"
      ? "Short story"
      : listMatch.type === "blog"
        ? "Blog"
        : "Poem";

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-8 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/75 shadow-[0_1px_0_rgba(0,0,0,0.25)] backdrop-blur">
            {typeLabel}
          </span>
          {(listMatch.author ?? "").trim() && (
            <span className="text-xs text-white/55">
              By {listMatch.author}
            </span>
          )}
          <span className="text-xs text-white/55">
            {new Date(listMatch.createdAt).toLocaleString()}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {listMatch.title}
        </h1>
        {(listMatch.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(listMatch.tags ?? []).map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        className="prose max-w-none prose-headings:tracking-tight prose-p:leading-7 prose-headings:text-white prose-p:text-white/75 prose-a:text-cyan-200 prose-strong:text-white prose-hr:border-white/10 prose-pre:rounded-xl prose-pre:bg-black/40 prose-pre:text-white/80"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="mt-10">
        <Link className="text-sm text-white/65 underline hover:text-white" href="/">
          ← Back to library
        </Link>
      </div>
    </article>
  );
}


