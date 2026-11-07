import { ContentLiveRefresh } from "@/components/website/content-live-refresh";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const note = await prisma.note.findFirst({ where: { slug: params.slug, status: "PUBLISHED" } });
  return {
    title: `${note?.seoTitle || note?.title || "Engineering Note"} | MD Tanvir Khan`,
    description: note?.seoDescription || note?.fullContent.slice(0, 160) || "Engineering note by MD Tanvir Khan.",
  };
}

export default async function NoteDetailPage({ params }: Props) {
  const note = await prisma.note.findFirst({ where: { slug: params.slug, status: "PUBLISHED" } });
  if (!note) notFound();

  return (
    <div className="min-h-screen bg-[#0E0E34] text-[#F7F6F7] relative selection:bg-[#00D2D3]/40 selection:text-[#F7F6F7] flex flex-col">
      <ContentLiveRefresh />
            <ContentLiveRefresh /><PremiumBackground /><Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 space-y-8 sm:space-y-10">
        <Link href="/blog/notes" className="inline-flex items-center space-x-2 text-xs font-mono text-[#789BE0] hover:text-white transition-colors min-h-[44px]"><ArrowLeft className="w-4 h-4" /><span>Back to notes</span></Link>
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-purple-300 font-mono"><span>{note.category}</span><span>•</span><span>{note.publishDate}</span></div>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">{note.title}</h1>
          <p className="text-sm text-slate-300 flex items-center gap-2"><User className="w-4 h-4" />{note.author}</p>
        </header>
        {note.coverImage && <div className="rounded-3xl overflow-hidden border border-purple-500/30 shadow-card bg-[#141444] aspect-video max-h-[450px]"><img src={note.coverImage} alt={note.title} className="w-full h-full object-cover" /></div>}
        {note.commandSnippet && <pre className="rounded-2xl bg-[#020824] border border-purple-500/20 p-5 font-mono text-sm text-purple-200 overflow-x-auto whitespace-pre-wrap">{note.commandSnippet}</pre>}
        <article className="glass-panel p-6 sm:p-12 rounded-3xl border border-purple-500/30 text-[#DCE3F6] leading-8 whitespace-pre-wrap break-words">{note.fullContent}</article>
        {note.referenceLink && <a href={note.referenceLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-white">Reference link</a>}
        {!!note.tags.length && <div className="flex flex-wrap gap-2">{note.tags.map((tag) => <span key={tag} className="text-xs rounded-full border border-purple-500/20 px-3 py-1 text-purple-200">#{tag}</span>)}</div>}
      </main><Footer />
    </div>
  );
}
