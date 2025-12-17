"use client";

import { useEffect, useMemo, useState } from "react";

export function PublishToast() {
  const [open, setOpen] = useState(false);

  const shouldShow = useMemo(() => {
    if (typeof window === "undefined") return false;
    const url = new URL(window.location.href);
    return url.searchParams.get("published") === "1";
  }, []);

  useEffect(() => {
    if (!shouldShow) return;
    setOpen(true);

    // Clean the URL query param for a polished feel.
    const url = new URL(window.location.href);
    url.searchParams.delete("published");
    window.history.replaceState({}, "", url.toString());
  }, [shouldShow]);

  if (!open) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(420px,calc(100vw-40px))]">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">
              Published to your portfolio blog
            </p>
            <p className="mt-1 text-sm text-white/70">
              I’m using this blog for my portfolio to showcase my work, so please
              be aware of that.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/10 hover:bg-white/15"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


