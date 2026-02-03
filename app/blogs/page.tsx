import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog & Resources | Incenta',
    description: 'Pro tips on growth hacking, referral engineering, and building high-scale SaaS systems.',
};

export default async function BlogsPage() {
    // Fetch blogs directly in Server Component
    const blogs = await (prisma as any).blog.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header - Using standard Navbar or consistent design */}
            <header className="fixed top-0 w-full z-[100] px-4 md:px-8 py-4 md:py-6">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between glass-panel px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <img src="/logos/logo.png" alt="Incenta Logo" className="h-8 md:h-12 w-auto" />
                        </Link>
                    </div>
                    <nav className="hidden lg:flex items-center gap-10">
                        <Link className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/#features">The Grid</Link>
                        <Link className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/#developer">Infrastructure</Link>
                        <Link className="text-xs font-bold uppercase tracking-widest text-primary transition-colors" href="/blogs">Library</Link>
                    </nav>
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link href="/login" className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest px-2 md:px-4">Login</Link>
                        <Link href="/signup" className="bg-navy text-white text-[10px] md:text-xs font-extrabold uppercase tracking-widest px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl hover:bg-primary transition-all">Get Started</Link>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 md:px-8 pt-44 pb-32">
                <div className="max-w-4xl mb-20">
                    <span className="text-primary font-bold text-xs uppercase tracking-widest mb-6 block">Resource Hub</span>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-navy tracking-tight leading-tight mb-8">
                        Insights on <span className="italic font-light text-primary">Referral Velocity.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                        Explore our latest articles on growth engineering, fraud prevention, and SaaS infrastructure.
                    </p>
                </div>

                {blogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog: any) => (
                            <div
                                key={blog.id}
                                className="group relative bento-card rounded-[2.5rem] bg-white p-8 flex flex-col hover:shadow-2xl hover:shadow-primary/5 transition-all border border-slate-100 h-full"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                                        {blog.category}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : 'Draft'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-extrabold text-navy mb-4 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                    {blog.title}
                                </h3>
                                <div
                                    className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3 font-medium opacity-80"
                                    dangerouslySetInnerHTML={{ __html: blog.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...' }}
                                />
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-extrabold text-slate-400 uppercase tracking-tighter">
                                            {blog.author.charAt(0)}
                                        </div>
                                        <span className="text-xs font-bold text-navy opacity-70">{blog.author}</span>
                                    </div>
                                    <Link
                                        href={`/blogs/${blog.slug}`}
                                        className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-navy hover:bg-primary hover:text-white hover:border-primary transition-all group-hover:bg-primary group-hover:text-white"
                                    >
                                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </Link>
                                </div>
                                {/* Visual Accent */}
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="size-2 rounded-full bg-primary/20"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                        <div className="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <span className="material-symbols-outlined text-5xl text-slate-200">auto_stories</span>
                        </div>
                        <h3 className="text-2xl font-bold text-navy mb-3">The library is currently being curated.</h3>
                        <p className="text-slate-500 max-w-sm mx-auto font-medium">Check back shortly for our first deep-dive into referral architecture.</p>
                        <Link href="/" className="mt-10 inline-block text-xs font-extrabold uppercase tracking-widest text-primary hover:underline">Return to Hub</Link>
                    </div>
                )}
            </main>

            <footer className="bg-white border-t border-slate-100 py-16">
                <div className="max-w-[1400px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-8">
                        <img src="/logos/logo.png" alt="Incenta Logo" className="h-10 grayscale opacity-40" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2024 Incenta Infrastructure</p>
                    </div>
                    <div className="flex gap-10">
                        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-navy uppercase tracking-widest transition-colors">Home</Link>
                        <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-navy uppercase tracking-widest transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-navy uppercase tracking-widest transition-colors">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
