import { ContentLiveRefresh } from "@/components/website/content-live-refresh";
import { Navbar } from "@/components/website/navbar";
import { Footer } from "@/components/website/footer";
import { PremiumBackground } from "@/components/website/premium-background";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, User, Clock, ArrowRight, Star, Search, Sparkles, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
    title: "Articles & Insights | MD Tanvir Khan",
    description: "Practical knowledge, real-world solutions, and in-depth deep dives into modern networking, security, and infrastructure.",
};



// Server Component-e searchParams automatically pass hoy
export default async function ArticlesPage({
    searchParams,
}: {
    searchParams: { category?: string; q?: string };
}) {
    // URL theke category ebong search text niye asha
    const category = searchParams.category || "All";
    const q = (searchParams.q || "").toLowerCase();

    const [dbArticles, categoryRows, pageSetting] = await Promise.all([
        prisma.article.findMany({ where: { status: "PUBLISHED" }, orderBy: [{ featured: "desc" }, { publishDate: "desc" }] }),
        prisma.articleCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
        prisma.siteSetting.findUnique({ where: { key: "articles_page_settings" } }),
    ]);
    const categories = ["All", ...(categoryRows.length ? categoryRows.filter((item) => item.active).map((item) => item.name) : ["Networking", "System Administration", "Cybersecurity", "Network Security", "Cloud & Infrastructure", "Tools & Technologies", "Security Updates", "Best Practices", "Industry Insights"])];
    const settings = (pageSetting?.value && typeof pageSetting.value === "object" ? pageSetting.value : {}) as Record<string, any>;

    // Data filter kora
    const filteredArticles = dbArticles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(q) || (article.fullContent || "").toLowerCase().includes(q);
        const matchesCat = category === "All" || article.category === category;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#020824] font-sans text-slate-300 selection:bg-cyan-500/40 selection:text-white">
            {/* Background Effects */}
            <ContentLiveRefresh />
            <PremiumBackground />
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute left-[-10%] top-[-15%] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />
                <div className="absolute right-[-10%] top-[5%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[140px]" />
            </div>

            {/* Navbar */}
            <Navbar />

            <main className="relative z-10 mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">

                {/* Page Header */}
                <header className="mx-auto mb-9 max-w-3xl text-center" style={{ display: settings.showHero === false ? "none" : undefined }}>
                    <div className="mb-3 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-200">
                        <span className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400" />
                        <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                        <span>{settings.pageLabel || "Explore • Learn • Build"}</span>
                        <span className="h-px w-16 bg-gradient-to-l from-transparent to-cyan-400" />
                    </div>

                    <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-transparent sm:text-5xl lg:text-[46px] bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text">
                        {settings.articlesTitle || settings.mainTitle || "Articles & Insights"}
                    </h1>

                    <p className="mx-auto mt-3 max-w-2xl text-xs font-medium leading-relaxed text-cyan-100/90 sm:text-sm">
                        {settings.articlesDesc || settings.subtitle || "Practical knowledge, real-world solutions, and in-depth deep dives into modern networking, security, and infrastructure."}
                    </p>
                </header>

                {/* Search & Category Filter (Server Side Controlled) */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4 bg-[#06122d]/80 border border-cyan-500/30 p-4 rounded-3xl backdrop-blur-xl shadow-[0_0_35px_rgba(34,211,238,0.1)]">

                    {/* Native Form for Search without Client Component */}
                    <form method="GET" action="/blog/articles" className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/50" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={searchParams.q || ""}
                            placeholder="Search articles (Press Enter)..."
                            className="w-full bg-[#020824] border border-cyan-500/20 rounded-2xl pl-11 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 transition-colors"
                        />
                        {/* Preserve category parameter when searching */}
                        {category !== "All" && <input type="hidden" name="category" value={category} />}
                    </form>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                        {categories.map((cat) => (
                            <Link
                                key={cat}
                                href={`/blog/articles?category=${encodeURIComponent(cat)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                                className={`px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${category === cat
                                    ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                                    : "bg-[#020824] border border-cyan-500/10 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30"
                                    }`}
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.length === 0 ? (
                        <div className="col-span-full py-16 text-center border border-cyan-500/20 rounded-3xl bg-[#06122d]/50 backdrop-blur-md">
                            <p className="text-slate-400 text-sm font-mono">No published articles found.</p>
                        </div>
                    ) : (
                        filteredArticles.map((article) => (
                            <div key={article.id} className="group relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#06122d]/80 flex flex-col justify-between hover:-translate-y-1 hover:border-cyan-400/70 hover:shadow-[0_0_28px_rgba(34,211,238,0.16)] transition-all duration-300 backdrop-blur-xl">
                                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_55%)]" />

                                <div>
                                    <div className="relative h-48 w-full overflow-hidden bg-[#020824]">
                                        {article.coverImage ? (
                                            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-cyan-500/30 font-mono text-xs border-b border-cyan-500/20">No Cover Image</div>
                                        )}
                                        {article.featured && (
                                            <span className="absolute top-3 left-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 backdrop-blur-md">
                                                <Star className="w-3 h-3 fill-amber-300" /> Featured
                                            </span>
                                        )}
                                        <span className="absolute bottom-3 right-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold px-2.5 py-1 rounded-xl backdrop-blur-md">
                                            {article.category}
                                        </span>
                                    </div>

                                    <div className="p-6 space-y-3 relative">
                                        <div className="flex items-center gap-4 text-[10px] text-cyan-400/70 font-mono">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {article.publishDate}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.readTime}</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">{article.title}</h3>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{article.fullContent}</p>

                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {(article.tags || []).map((tag: string) => (
                                                <span key={tag} className="text-[10px] font-mono bg-cyan-500/5 px-2 py-0.5 rounded text-cyan-300 border border-cyan-500/20">#{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 pt-0 flex items-center justify-between border-t border-cyan-500/20 mt-4 relative">
                                    <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-cyan-400" /> {article.author}
                                    </span>
                                    <Link href={`/blog/articles/${article.slug}`} className="text-[11px] text-cyan-400 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                        Read Article <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
                    <div className="h-px w-20 bg-gradient-to-r from-transparent via-cyan-400 to-cyan-400" />
                    <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-slate-400">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Share Knowledge</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-white">Build Community</span>
                    </div>
                    <div className="h-px w-20 bg-gradient-to-l from-transparent via-cyan-400 to-cyan-400" />
                </div>
            </main>

            <Footer />
        </div>
    );
}