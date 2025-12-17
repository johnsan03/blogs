import { getAllPieces, type PieceListItem } from "@/lib/pieces";
import { PublishToast } from "@/app/_components/PublishToast";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/75 shadow-[0_1px_0_rgba(0,0,0,0.25)] backdrop-blur">
      {children}
    </span>
  );
}

function TypeLabel({ type }: { type: PieceListItem["type"] }) {
  const label =
    type === "short-story" ? "Short story" : type === "blog" ? "Blog" : "Poem";
  return <Badge>{label}</Badge>;
}

export default async function Home() {
  const pieces = await getAllPieces();

  return (
    <div className="space-y-10">
      <PublishToast />
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Blog / Short Story / Poem
            </h1>
            <p className="mt-2 max-w-2xl text-white/70">
              Write about any topic you love. Publish it to your personal library
              as a blog post, a short story, or a poem.
            </p>
          </div>
          <a
            href="/write"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2.5 text-sm font-medium text-black shadow-sm shadow-black/25 ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md hover:shadow-black/30"
          >
            Start writing
          </a>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Badge>Markdown</Badge>
          <Badge>Frontmatter</Badge>
          <Badge>File-based content</Badge>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Your library
          </h2>
          <p className="text-sm text-white/55">
            {pieces.length} piece{pieces.length === 1 ? "" : "s"}
          </p>
        </div>

        {pieces.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-white/65 backdrop-blur">
            No pieces yet. Create your first one on{" "}
            <a className="underline" href="/write">
              /write
            </a>
            .
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {pieces.map((p) => (
              <a
                key={p.slug}
                href={`/p/${p.slug}`}
                className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07] hover:shadow-[0_16px_44px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-white">
                    {p.title}
                  </h3>
                  <TypeLabel type={p.type} />
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-white/70">
                  {p.excerpt || "—"}
                </p>
                {(p.author ?? "").trim() && (
                  <p className="mt-3 text-xs text-white/55">
                    By {p.author}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {(p.tags ?? []).slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-xs text-white/45">
                  {new Date(p.createdAt).toLocaleString()}
                </p>
              </a>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
