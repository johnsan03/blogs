import { getPieceBySlug } from "@/lib/pieces";
import { notFound } from "next/navigation";

export default async function PiecePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const piece = await getPieceBySlug(slug);
  if (!piece) notFound();

  const typeLabel =
    piece.type === "short-story"
      ? "Short story"
      : piece.type === "blog"
        ? "Blog"
        : "Poem";

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-8 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/75 shadow-[0_1px_0_rgba(0,0,0,0.25)] backdrop-blur">
            {typeLabel}
          </span>
          {(piece.author ?? "").trim() && (
            <span className="text-xs text-white/55">
              By {piece.author}
            </span>
          )}
          <span className="text-xs text-white/55">
            {new Date(piece.createdAt).toLocaleString()}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {piece.title}
        </h1>
        {(piece.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {piece.tags!.map((t) => (
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
        dangerouslySetInnerHTML={{ __html: piece.html }}
      />

      <div className="mt-10">
        <a
          className="text-sm text-white/65 underline hover:text-white"
          href="/"
        >
          ← Back to library
        </a>
      </div>
    </article>
  );
}


