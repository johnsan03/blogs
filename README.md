# Writing Studio (Blog / Short Story / Poem)

This project satisfies the prompt **“Blog/Short Story/Poem: Write about any topic you love.”**

You can write a **blog**, **short story**, or **poem** in Markdown, publish it, and read it back in a clean reader view.

## How to run

From the project folder:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Xano database (optional / recommended)

This app can save and load posts from Xano:

- **GET** + **POST**: `https://x8ki-letl-twmt.n7.xano.io/api:WpZv-jLF/content_post`

To configure via environment variable, create a `.env.local`:

```bash
XANO_CONTENT_POST_URL="https://x8ki-letl-twmt.n7.xano.io/api:WpZv-jLF/content_post"
```

If the Xano endpoint is unreachable, the app will fall back to local Markdown files in `content/`.

## How to use (assignment flow)

- Go to **Write** (`/write`)
- Choose **Type**: Blog / Short story / Poem
- Add a **Title**, optional **Tags**, and write your piece
- Click **Publish**

Published pieces are saved as Markdown files in `content/` and will appear on the **Library** home page.

## Project structure

- `content/`: saved pieces (`.md` with frontmatter)
- `src/app/page.tsx`: library + prompt/CTA
- `src/app/write/page.tsx`: editor + publish
- `src/app/p/[slug]/page.tsx`: reader page
- `src/app/api/pieces/route.ts`: API to list/create pieces
- `src/lib/pieces.ts`: file I/O + Markdown rendering

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
