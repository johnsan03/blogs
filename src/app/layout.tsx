import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BackgroundFX } from "@/app/_components/BackgroundFX";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Writing Studio",
  description: "Write and publish blogs, short stories, and poems.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BackgroundFX />
        <div className="min-h-screen text-zinc-950 dark:text-zinc-50">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-black/25 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
              <a
                href="/"
                className="group flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-90"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-300 text-sm text-black shadow-sm shadow-black/20 ring-1 ring-white/15 transition-transform duration-300 group-hover:-translate-y-0.5">
                  WS
                </span>
                <span className="text-sm text-white/90 sm:text-base">
                  Writing Studio
                </span>
              </a>
              <nav className="flex items-center gap-2 text-sm">
                <a
                  href="/"
                  className="rounded-full px-3 py-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Library
                </a>
                <a
                  href="/write"
                  className="rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-3 py-1.5 font-medium text-black shadow-sm shadow-black/20 ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md hover:shadow-black/25"
                >
                  Write
                </a>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl px-4 py-10 animate-fade-up">
            {children}
          </main>
          <footer className="border-t border-white/10 py-12 text-sm text-white/55">
            <div className="mx-auto w-full max-w-5xl px-4">
              
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
