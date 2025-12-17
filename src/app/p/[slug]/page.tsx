"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchPieceBySlug } from "@/lib/xanoClient";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";

export default function PiecePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState<string | undefined>(undefined);
  const [type, setType] = useState<"blog" | "short-story" | "poem">("blog");
  const [tags, setTags] = useState<string[]>([]);
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    if (!slug) return;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const piece = await fetchPieceBySlug(slug);
        if (!piece) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const processed = String(
          await remark().use(remarkGfm).use(remarkHtml).process(piece.content),
        );
        if (cancelled) return;
        setTitle(piece.title);
        setAuthor(piece.author);
        setType(piece.type);
        setTags(piece.tags ?? []);
        setCreatedAt(piece.createdAt);
        setHtml(processed);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const typeLabel = useMemo(() => {
    return type === "short-story"
      ? "Short story"
      : type === "blog"
        ? "Blog"
        : "Poem";
  }, [type]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/65 backdrop-blur">
        Loading…
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-white/65 backdrop-blur">
        Not found.{" "}
        <Link className="underline" href="/">
          Back to library
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-8 space-y-3 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/75 shadow-[0_1px_0_rgba(0,0,0,0.25)] backdrop-blur">
            {typeLabel}
          </span>
          {(author ?? "").trim() && (
            <span className="text-xs text-white/55">
              By {author}
            </span>
          )}
          <span className="text-xs text-white/55">
            {new Date(createdAt).toLocaleString()}
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
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


