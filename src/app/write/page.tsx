"use client";

import { useMemo, useState } from "react";

type PieceType = "blog" | "short-story" | "poem";

const PLACEHOLDERS: Record<PieceType, string> = {
  blog: `# Title\n\nWrite a blog post about something you love.\n\n- What do you believe?\n- What did you learn?\n- What should the reader do next?\n`,
  "short-story": `# Title\n\nWrite a short story about something you love.\n\nStart in the middle of a moment.\n`,
  poem: `# Title\n\nWrite a poem about something you love.\n\nTry: imagery, sound, and one honest line.\n`,
};

function wordCount(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [type, setType] = useState<PieceType>("blog");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState(PLACEHOLDERS.blog);
  const [agreePortfolio, setAgreePortfolio] = useState(false);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "error"; message: string }
    | { kind: "published"; slug: string }
  >({ kind: "idle" });

  const wc = useMemo(() => wordCount(content), [content]);
  const target = type === "poem" ? "50–200 words" : type === "short-story" ? "500–1500 words" : "400–1200 words";

  async function publish() {
    if (!agreePortfolio) {
      setStatus({
        kind: "error",
        message:
          "Please confirm the portfolio notice by checking the required box before publishing.",
      });
      return;
    }

    setStatus({ kind: "saving" });
    try {
      const res = await fetch("/api/pieces", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Untitled",
          author: author.trim() || undefined,
          type,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          content,
        }),
      });

      const json = (await res.json()) as { slug?: string; error?: string };
      if (!res.ok || !json.slug) {
        throw new Error(json.error || "Failed to publish");
      }

      // Send user back to library and show a notice there.
      window.location.href = "/?published=1";
    } catch (e) {
      setStatus({
        kind: "error",
        message: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  function onChangeType(next: PieceType) {
    setType(next);
    // If the user hasn't customized much yet, swap to the new placeholder for guidance.
    if (!title.trim() && content.trim() === PLACEHOLDERS[type].trim()) {
      setContent(PLACEHOLDERS[next]);
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          Write about any topic you love
        </h1>
        <p className="text-sm text-white/70">
          Choose a format (blog / short story / poem), write in Markdown, then
          publish.
        </p>
      </header>

      <section className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur md:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2 lg:col-span-2">
          <div className="text-sm font-medium text-white/85">Title</div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Coffee Shop That Saved My Week"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none ring-1 ring-transparent placeholder:text-white/35 transition focus:border-white/20 focus:ring-2 focus:ring-indigo-500/30"
          />
        </label>

        <label className="space-y-2">
          <div className="text-sm font-medium text-white/85">Writer name</div>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. John San"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none ring-1 ring-transparent placeholder:text-white/35 transition focus:border-white/20 focus:ring-2 focus:ring-indigo-500/30"
          />
        </label>

        <label className="space-y-2">
          <div className="text-sm font-medium text-white/85">Type</div>
          <select
            value={type}
            onChange={(e) => onChangeType(e.target.value as PieceType)}
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none ring-1 ring-transparent transition focus:border-white/20 focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="blog">Blog</option>
            <option value="short-story">Short story</option>
            <option value="poem">Poem</option>
          </select>
        </label>

        <label className="space-y-2">
          <div className="text-sm font-medium text-white/85">
            Tags (comma separated)
          </div>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. love, memories, winter"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/90 outline-none ring-1 ring-transparent placeholder:text-white/35 transition focus:border-white/20 focus:ring-2 focus:ring-indigo-500/30"
          />
        </label>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-sm">
            <div className="font-medium text-white/85">Editor</div>
            <div className="text-xs text-white/55">
              {wc} words · suggested {target}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[420px] w-full resize-y rounded-b-3xl bg-transparent p-5 font-mono text-sm leading-6 text-white/85 outline-none placeholder:text-white/35"
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="border-b border-white/10 px-5 py-3 text-sm font-medium text-white/85">
            Preview
          </div>
          <div className="prose max-w-none p-5 prose-headings:text-white prose-p:text-white/75 prose-strong:text-white">
            <h1 className="tracking-tight">{title.trim() || "Untitled"}</h1>
            <p className="text-sm text-white/55">
              {author.trim() ? `By ${author.trim()} · ` : ""}
              {type === "short-story" ? "Short story" : type === "blog" ? "Blog" : "Poem"}
              {tags.trim() ? ` · ${tags}` : ""}
            </p>
            <pre className="whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-sm leading-6 text-white/80 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]">
              {content}
            </pre>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {status.kind === "error" ? (
            <p className="text-sm text-red-300">{status.message}</p>
          ) : (
            <p className="text-sm text-white/65">
              When you publish, your piece is saved as a Markdown file in{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-white/75">
                content/
              </code>
              .
            </p>
          )}

          <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">
            <input
              type="checkbox"
              checked={agreePortfolio}
              onChange={(e) => setAgreePortfolio(e.target.checked)}
              className="mt-1 h-4 w-4 accent-cyan-300"
            />
            <span>
              <span className="font-medium text-white/90">Required:</span> I
              understand this blog is being used for a <a href="https://johnsan03.github.io/Portfolio/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">portfolio</a> to showcase
              work, so I will not publish sensitive/personal information.
            </span>
          </label>
        </div>

        <button
          onClick={publish}
          disabled={status.kind === "saving" || !agreePortfolio}
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-2.5 text-sm font-medium text-black shadow-sm shadow-black/25 ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md hover:shadow-black/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.kind === "saving" ? "Publishing…" : "Publish"}
        </button>
      </section>
    </div>
  );
}


