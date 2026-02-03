import { prisma } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const blog = await (prisma as any).blog.findUnique({
        where: { slug, status: 'PUBLISHED' },
    });

    if (!blog) return { title: 'Post Not Found' };

    return {
        title: `${blog.title} | Incenta Engineering`,
        description: blog.content.replace(/<[^>]*>?/gm, '').substring(0, 160),
        openGraph: {
            title: blog.title,
            description: blog.content.replace(/<[^>]*>?/gm, '').substring(0, 160),
            type: 'article',
        },
    };
}

export default async function BlogDetailPage({ params }: Props) {
    const { slug } = await params;

    const blog = await (prisma as any).blog.findUnique({
        where: { slug, status: 'PUBLISHED' },
    });

    if (!blog) {
        notFound();
    }

    const simpleDate = blog.publishedAt
        ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Draft';

    // Calculate read time (rough estimate)
    const words = blog.content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
    const readTime = Math.ceil(words / 200);

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-primary/20">
            {/* Dynamic Header - Consistent with app */}
            <header className="fixed top-0 w-full z-[100] px-4 md:px-8 py-4 md:py-6">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between glass-panel px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <img src="/logos/logo.png" alt="Incenta Logo" className="h-8 md:h-12 w-auto" />
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/blogs" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors pr-6 mr-6 border-r border-slate-100 hidden md:block">Library</Link>
                        <Link href="/signup" className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest bg-navy text-white px-5 py-3 rounded-xl hover:bg-primary transition-all shadow-lg shadow-navy/5">Deploy Program</Link>
                    </div>
                </div>
            </header>

            <main className="pt-32 md:pt-44 pb-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-8">

                    {/* Hero Section */}
                    <div className="max-w-4xl mb-16 md:mb-24">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="h-px w-8 bg-primary/50"></span>
                            <span className="text-xs font-mono text-primary uppercase tracking-widest">{blog.category || 'Engineering'}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-navy tracking-tight leading-[1.1] mb-8">
                            {blog.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl">
                            {blog.content.replace(/<[^>]*>?/gm, '').substring(0, 140)}...
                        </p>
                    </div>

                    {/* Split Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 border-t border-slate-100 pt-12 md:pt-20">
                        {/* Sidebar - Metadata */}
                        <aside className="lg:col-span-3 lg:sticky lg:top-40 h-fit space-y-10 order-2 lg:order-1">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Written By</p>
                                    <div className="flex items-center gap-3 pt-2">
                                        <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-200">
                                            {blog.author.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-navy text-sm">{blog.author}</p>
                                            <p className="text-xs text-slate-500">Tech Lead</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Published</p>
                                    <p className="font-mono text-sm text-navy">{simpleDate}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Read Time</p>
                                    <p className="font-mono text-sm text-navy">{readTime} min read</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Share</p>
                                    <div className="flex gap-2">
                                        <button className="size-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">link</span>
                                        </button>
                                        <button className="size-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors">
                                            <span className="material-symbols-outlined text-[16px]">share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main Content */}
                        <article className="lg:col-span-8 order-1 lg:order-2">
                            <div
                                className="blog-content prose prose-lg prose-slate max-w-none 
                                prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-navy
                                prose-p:text-slate-600 prose-p:leading-8 prose-p:font-medium
                                prose-li:text-slate-600 prose-li:marker:text-primary
                                prose-strong:text-navy prose-strong:font-bold
                                prose-pre:bg-code-bg prose-pre:border prose-pre:border-slate-800
                                prose-blockquote:border-l-primary prose-blockquote:bg-slate-50/50 prose-blockquote:not-italic prose-blockquote:text-slate-700
                                prose-a:text-primary prose-a:no-underline prose-a:font-bold hover:prose-a:underline
                                prose-img:rounded-3xl prose-img:shadow-2xl prose-img:border prose-img:border-slate-100"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />

                            {/* Technical Footer Block */}
                            <div className="mt-20 p-8 md:p-12 bg-slate-50 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                                <div className="relative z-10">
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary mb-2 block">Next Steps</span>
                                    <h3 className="text-2xl font-bold text-navy mb-4">Ready to implement this architecture?</h3>
                                    <div className="flex items-center gap-6">
                                        <Link href="/docs" className="text-sm font-bold border-b border-navy pb-0.5 hover:text-primary hover:border-primary transition-colors">Read Documentation</Link>
                                        <Link href="/signup" className="text-sm font-bold border-b border-navy pb-0.5 hover:text-primary hover:border-primary transition-colors">Get API Keys</Link>
                                    </div>
                                </div>
                            </div>
                        </article>

                    </div>
                </div>
            </main>

            <footer className="border-t border-slate-50 py-16 bg-white">
                <div className="max-w-[1400px] mx-auto px-8 flex justify-between items-center">
                    <Link href="/blogs" className="flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-navy transition-all group">
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Back to Library
                    </Link>
                    <span className="text-[10px] font-mono text-slate-300">Incenta Engineering Blog © 2024</span>
                </div>
            </footer>
        </div>
    );
}
