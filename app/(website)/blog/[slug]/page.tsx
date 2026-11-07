import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { BlogReactions } from "@/components/website/blog-reactions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, FileText, Download, ExternalLink, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  return {
    title: `${post?.seoTitle || post?.title || "Engineering Article"} | MD Tanvir Khan`,
    description: post?.seoDescription || post?.excerpt || "Technical writeup by MD Tanvir Khan.",
  };
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const dbPost = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  const fallbackPosts: Record<string, any> = {
    "architecting-nextjs-monoliths-subtle-crypto-prisma": {
      title: "Architecting Next.js 14 Monoliths with Subtle Crypto & Prisma",
      publishedAt: new Date("2024-04-10"),
      excerpt:
        "Why building self-hosted, type-safe Next.js monoliths with Prisma ORM outperforms microservice sprawl for 95% of engineering teams.",
      content: `The microservice hype cycle convinced thousands of teams to split simple products into dozens of decoupled containers. The result? Network latency overhead, distributed tracing complexity, and fragile authentication boundaries.

In this architecture breakdown, we explore the modern alternative: A unified Next.js 14 monolith powered by the App Router, Server Actions, and Prisma ORM on PostgreSQL.

### 1. Eliminating Microservice Latency with Server Actions
Next.js Server Actions execute on the server without introducing client-exposed REST boilerplate. When paired with PostgreSQL connection poolers like PgBouncer or Supabase transaction mode, round-trips drop from hundreds of milliseconds to under 30ms.

### 2. Zero-Dependency Subtle Crypto Sessions
Instead of pulling in bulky third-party libraries, modern web standards allow us to use the native Web Crypto API:
\`\`\`typescript
const key = await crypto.subtle.importKey(
  "raw",
  encoder.encode(SECRET),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"]
);
\`\`\`
This runs natively across Node.js and Edge runtimes with zero cold-start penalty.

### Conclusion
By keeping your data modeling, administrative tooling, and public presentation layer within a single type-safe repository, you eliminate weeks of coordination overhead and ship software that performs impeccably.`,
      attachments: [],
    },
    "mathematics-of-fluid-typography-design-systems": {
      title: "The Mathematics of Fluid Typography & Generative Design Systems",
      publishedAt: new Date("2024-03-24"),
      excerpt:
        "Exploring modular type scales, CSS clamp() mathematics, and how to eliminate discrete responsive breakpoints for truly fluid interfaces.",
      content: `Discrete media query breakpoints (sm, md, lg, xl) create awkward jarring jumps as screens resize between standard dimensions. The solution is calculating continuous mathematical curves using CSS clamp().

### The Linear Interpolation Formula
To calculate a font size that scales smoothly between 16px at 320px viewport and 24px at 1280px viewport:
\`\`\`css
font-size: clamp(1rem, 0.733rem + 1.33vw, 1.5rem);
\`\`\`

When combined with a musical ratio (such as the Golden Ratio 1.618 or Major Third 1.25), headings maintain proportional harmony across phones, foldable screens, and ultra-wide desktop monitors.`,
      attachments: [],
    },
    "60fps-micro-interactions-gpu-physics": {
      title: "60 FPS Micro-Interactions: Offloading Physics to the GPU",
      publishedAt: new Date("2024-02-15"),
      excerpt:
        "A deep dive into Motion for React spring physics, will-change profiling, and avoiding layout reflows during complex interactive states.",
      content: `Delight lives in the micro-interactions. However, poorly structured animations trigger DOM layout recalculations that drop frame rates below 60 FPS.

### The Rule of Transforms
Never animate top, left, width, or height. Always animate:
- \`transform: translate3d(x, y, 0)\`
- \`transform: scale()\`
- \`opacity\`

These three properties are processed entirely by the GPU compositor layer, completely bypassing the browser's expensive layout and paint cycles.`,
      attachments: [],
    },
    "zero-downtime-postgresql-migrations": {
      title: "Zero-Downtime PostgreSQL Migrations in High-Concurrency Apps",
      publishedAt: new Date("2024-01-28"),
      excerpt:
        "Step-by-step strategies for altering tables, backfilling historical data, and swapping columns without locking relational tables in production.",
      content: `Altering a PostgreSQL column directly with a lock can bring down live production systems if concurrent queries are pending.

### The Expand & Contract Pattern
1. **Expand**: Add the new nullable column without altering the old one.
2. **Dual-Write**: Update your application code to write to both columns simultaneously.
3. **Backfill**: Run asynchronous background worker batches to copy historical data from old to new.
4. **Contract**: Shift reads to the new column, deprecate the old column, and safely drop it in a subsequent release.`,
      attachments: [],
    },
  };

  const post = dbPost || fallbackPosts[params.slug];

  if (!post) {
    notFound();
  }

  const attachments = Array.isArray(post.attachments) ? (post.attachments as any[]) : [];

  return (
    <div className="min-h-screen bg-[#0E0E34] text-[#F7F6F7] relative selection:bg-[#00D2D3]/40 selection:text-[#F7F6F7] flex flex-col">
      <PremiumBackground />
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 space-y-8 sm:space-y-10">
        <Link
          href="/blog"
          className="inline-flex items-center space-x-2 text-xs font-mono text-[#789BE0] hover:text-white transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all articles</span>
        </Link>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex items-center space-x-2 text-xs text-[#789BE0] font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>Published on {formatDate(post.publishedAt || post.createdAt)}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg text-[#DCE3F6] leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Cover Image */}
        {post.coverUrl && (
          <div className="rounded-3xl overflow-hidden border border-[#5A7FC8]/30 shadow-card bg-[#141444] aspect-video max-h-[450px]">
            <img
              src={post.coverUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <article className="glass-panel p-6 sm:p-12 rounded-3xl border border-[#5A7FC8]/30 space-y-6">
          <div className="text-[#DCE3F6] text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 font-sans selection:bg-[#00D2D3]/40">
            {post.content}
          </div>
        </article>

        {/* Interactive Blog Reactions */}
        <BlogReactions postSlug={params.slug} />

        {/* Supplementary Files */}
        {attachments.length > 0 && (
          <section className="pt-8 border-t border-[#5A7FC8]/20 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#789BE0]">
              Attached Resources & PDF Documents
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {attachments.map((file: any, idx: number) => (
                <div
                  key={idx}
                  className="glass-panel p-4 rounded-2xl border border-[#5A7FC8]/30 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <FileText className="w-5 h-5 text-[#789BE0]" />
                    <span className="text-xs font-bold text-white truncate">{file.name}</span>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center text-xs font-mono text-[#789BE0] hover:text-white"
                  >
                    Open
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back Link */}
        <div className="pt-8 border-t border-[#5A7FC8]/20 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/blog"
            className="min-h-[44px] inline-flex items-center text-xs font-mono text-[#789BE0] hover:text-white transition-colors"
          >
            ← Back to Articles Archive
          </Link>
          <Link
            href="/contact"
            className="min-h-[44px] inline-flex items-center text-xs font-mono text-[#789BE0] hover:text-white transition-colors"
          >
            Have thoughts? Get in touch →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
