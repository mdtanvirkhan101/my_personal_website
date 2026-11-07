import { ContentLiveRefresh } from "@/components/website/content-live-refresh";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { User, ArrowRight, Search, Sparkles, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Engineering Notes | MD Tanvir Khan",
    description: "Step-by-step configuration examples, command cheat sheets, troubleshooting guides, and real-world deployment notes.",
};



// Server Component-e searchParams automatically pass hoy
export default async function NotesPage({
    searchParams,
}: {
    searchParams: { category?: string; q?: string };
}) {
    // URL theke category ebong search text niye asha
    const category = searchParams.category || "All";
    const q = (searchParams.q || "").toLowerCase();

    const [dbNotes, categoryRows, pageSetting] = await Promise.all([
        prisma.note.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { publishDate: "desc" }] }),
        prisma.noteCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
        prisma.siteSetting.findUnique({ where: { key: "articles_page_settings" } }),
    ]);
    const noteCategories = ["All", ...(categoryRows.length ? categoryRows.filter((item) => item.active).map((item) => item.name) : ["Troubleshooting", "Configuration Guides", "How-To", "Command & Cheat Sheets", "Network Configurations", "Firewall & Security Config", "Server Configuration", "Security Hardening", "Incident Analysis", "Lab Notes", "Deployment Notes", "Resources"])];
    const settings = (pageSetting?.value && typeof pageSetting.value === "object" ? pageSetting.value : {}) as Record<string, any>;

    // Data filter kora
    const filteredNotes = dbNotes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(q) || (note.fullContent || "").toLowerCase().includes(q);
        const matchesCat = category === "All" || note.category === category;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#020824] font-sans text-slate-300 selection:bg-purple-500/40 selection:text-white">
            {/* Background Effects */}
            <ContentLiveRefresh />
            <PremiumBackground />

            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute left-[-10%] top-[-15%] h-[420px] w-[420px] rounded-full bg-purple-500/10 blur-[120px]" />
                <div className="absolute right-[-10%] top-[5%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
            </div>

            {/* Navbar */}
            <Navbar />

            <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

                {/* Page Header */}
                <header className="mx-auto mb-9 max-w-3xl text-center" style={{ display: settings.showHero === false ? "none" : undefined }}>
                    <div className="mb-3 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-200">
                        <span className="h-px w-16 bg-gradient-to-r from-transparent to-purple-400" />
                        <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                        <span>{settings.pageLabel || "Quick Reference • Labs • Configs"}</span>
                        <span className="h-px w-16 bg-gradient-to-l from-transparent to-purple-400" />
                    </div>

                    <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-transparent sm:text-5xl lg:text-[46px] bg-gradient-to-r from-purple-300 via-fuchsia-400 to-cyan-500 bg-clip-text">
                        {settings.notesTitle || "Engineering Notes"}
                    </h1>

                    <p className="mx-auto mt-3 max-w-2xl text-xs font-medium leading-relaxed text-purple-100/90 sm:text-sm">
                        {settings.notesDesc || settings.subtitle || "Step-by-step configuration examples, command cheat sheets, troubleshooting guides, and real-world deployment notes."}
                    </p>
                </header>

                {/* Search & Category Filter (Server Side Controlled) */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#06122d]/80 border border-purple-500/30 p-4 rounded-3xl backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.1)]">

                    {/* Native Form for Search without Client Component */}
                    <form method="GET" action="/blog/notes" className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={searchParams.q || ""}
                            placeholder="Search notes & commands (Press Enter)..."
                            className="w-full bg-[#020824] border border-purple-500/20 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white outline-none focus:border-purple-400 transition-colors"
                        />
                        {/* Preserve category parameter when searching */}
                        {category !== "All" && <input type="hidden" name="category" value={category} />}
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                        {noteCategories.map((cat) => (
                            <Link
                                key={cat}
                                href={`/blog/notes?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                                className={`px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${category === cat
                                    ? "bg-purple-500/20 border border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                    : "bg-[#020824] border border-purple-500/10 text-slate-400 hover:text-purple-300 hover:border-purple-500/30"
                                    }`}
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Engineering Notes Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredNotes.length === 0 ? (
                        <div className="col-span-full py-16 text-center border border-purple-500/20 rounded-3xl bg-[#06122d]/50 backdrop-blur-md">
                            <p className="text-slate-400 text-sm font-mono">No published engineering notes found.</p>
                        </div>
                    ) : (
                        filteredNotes.map((note) => (
                            <div key={note.id} className="group relative overflow-hidden rounded-3xl border border-purple-500/30 bg-[#06122d]/80 flex flex-col justify-between p-6 hover:-translate-y-1 hover:border-purple-400/70 hover:shadow-[0_0_28px_rgba(168,85,247,0.16)] transition-all duration-300 backdrop-blur-xl">
                                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_55%)]" />

                                <div className="space-y-4 relative">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-xl border border-purple-500/30">
                                            {note.category}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">{note.publishDate}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors leading-snug">{note.title}</h3>
                                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{note.fullContent || note.seoDescription}</p>

                                    {/* Snippet display logic directly without client interactions */}
                                    {note.commandSnippet && (
                                        <div className="relative mt-4 rounded-2xl bg-[#020824] border border-purple-500/20 p-4 font-mono text-xs text-purple-300 overflow-x-auto shadow-[inset_0_0_15px_rgba(15,23,42,0.5)]">
                                            <pre>{note.commandSnippet}</pre>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {(note.tags || []).map((tag: string) => (
                                            <span key={tag} className="text-[10px] font-mono bg-purple-500/5 px-2 py-0.5 rounded text-purple-300 border border-purple-500/20">#{tag}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-5 mt-5 flex items-center justify-between border-t border-purple-500/20 relative">
                                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-purple-400" /> {note.author}
                                    </span>
                                    <Link href={`/blog/notes/${note.slug}`} className="text-[11px] text-purple-400 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                        View Full Note <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-12 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-400 to-purple-400" />
                    <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                        <span>Solve Real Problems</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-white">Learn Continuously</span>
                    </div>
                    <div className="h-px w-20 bg-gradient-to-l from-transparent via-purple-400 to-purple-400" />
                </div>
            </main>

            <Footer />
        </div>
    );
}