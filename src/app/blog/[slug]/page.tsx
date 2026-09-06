'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getBlogPostBySlug, getAllBlogPosts } from '@/lib/blog-data';
import { BlogCard } from '@/components/blog/BlogCard';
import {
  ChevronRight,
  Clock,
  User,
  Calendar,
  Share2,
  ArrowLeft,
  ShieldAlert,
  BookOpen,
  Atom,
  CheckCircle2,
  Check,
  ListOrdered,
  HelpCircle,
  FlaskConical,
  ExternalLink
} from 'lucide-react';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [copied, setCopied] = useState(false);

  const post = getBlogPostBySlug(slug);
  const allPosts = getAllBlogPosts();

  // Extract Table of Contents from Markdown headings (##)
  const tableOfContents = useMemo(() => {
    if (!post) return [];
    const headings: { text: string; id: string }[] = [];
    const lines = post.content.split('\n');
    lines.forEach((line) => {
      if (line.startsWith('## ') && !line.startsWith('### ')) {
        const text = line.replace('## ', '').trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        headings.push({ text, id });
      }
    });
    return headings;
  }, [post]);

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: post?.title,
            text: post?.excerpt,
            url: window.location.href,
          });
          return;
        } catch (err) {
          // User cancelled or share failed, fallback to copy
        }
      }
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4 font-sans">
        <h1 className="font-orbitron font-bold text-2xl text-content-primary">
          RESEARCH ARTICLE NOT FOUND
        </h1>
        <p className="text-xs text-content-secondary">
          The requested scientific monograph could not be located in our research archives.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center px-6 py-2.5 bg-brand text-white font-orbitron text-xs font-semibold rounded-full hover:bg-brand-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          RETURN TO BLOG REPOSITORY
        </Link>
      </div>
    );
  }

  const relatedPosts = allPosts
    .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((t) => post.tags.includes(t))))
    .slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-sans">
      
      {/* 1. Breadcrumbs & Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="flex items-center space-x-2 text-xs font-orbitron text-content-muted">
          <Link href="/" className="hover:text-brand transition-colors">HOME</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/blog" className="hover:text-brand transition-colors">RESEARCH BLOG</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-brand font-semibold truncate max-w-[220px]">{post.category.toUpperCase()}</span>
        </nav>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-border bg-brand-subtle text-brand text-xs font-orbitron font-medium hover:bg-brand-light transition-all shadow-sm active:scale-95"
          title="Share Research Article"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">LINK COPIED!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>SHARE ARTICLE</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Article Header */}
      <div className="space-y-4 border-b border-brand-border pb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3.5 py-1 bg-brand-light text-brand font-orbitron text-xs font-bold rounded-full">
            {post.category}
          </span>
          <span className="flex items-center text-xs text-content-muted font-sans ml-2">
            <Clock className="w-3.5 h-3.5 mr-1 text-brand" />
            {post.readTime}
          </span>
          <span className="text-content-muted">•</span>
          <span className="flex items-center text-xs text-content-muted font-sans">
            <Calendar className="w-3.5 h-3.5 mr-1 text-brand" />
            {new Date(post.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-orbitron font-extrabold leading-tight">
          {post.title}
        </h1>

        <p className="text-sm sm:text-base text-content-secondary leading-relaxed font-sans max-w-4xl">
          {post.excerpt}
        </p>

        <div className="flex items-center space-x-3 pt-3">
          <div className="w-10 h-10 rounded-full bg-brand-light text-brand flex items-center justify-center font-orbitron font-bold text-sm shadow-inner">
            {post.author[0]}
          </div>
          <div>
            <div className="font-semibold text-xs text-content-primary">{post.author}</div>
            <div className="text-[11px] text-content-muted flex items-center gap-1">
              <FlaskConical className="w-3 h-3 text-brand" />
              Peptra Bio Scientific Advisory Desk
            </div>
          </div>
        </div>
      </div>

      {/* 3. Featured Hero Image */}
      <div className="relative aspect-[21/9] w-full bg-[#FAF8FD] rounded-3xl overflow-hidden border-2 border-brand-border shadow-md">
        <Image
          src={post.image}
          alt={post.title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
      </div>

      {/* 4. Main Grid: Markdown Content + Table of Contents (Right Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Article Body Content Rendered with ReactMarkdown */}
        <div className={`space-y-8 text-content-secondary leading-relaxed font-sans ${tableOfContents.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => {
                const text = String(children);
                const id = text
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, '')
                  .replace(/\s+/g, '-');
                const isFAQ = text.toLowerCase().includes('frequently asked questions');
                return (
                  <h2
                    id={id}
                    className="group scroll-mt-24 font-orbitron font-bold text-xl sm:text-2xl text-content-primary pt-8 pb-2 border-b border-brand-border/70 flex items-center gap-2"
                  >
                    {isFAQ ? (
                      <HelpCircle className="w-6 h-6 text-brand shrink-0" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-brand shrink-0 group-hover:scale-125 transition-transform" />
                    )}
                    <span>{children}</span>
                  </h2>
                );
              },
              h3: ({ children }) => {
                const text = String(children);
                const isQuestion = text.startsWith('What') || text.startsWith('How') || text.startsWith('Why') || text.startsWith('Can') || text.startsWith('Does') || text.startsWith('Is') || text.startsWith('Q:');
                return (
                  <h3 className={`font-orbitron font-semibold text-base sm:text-lg text-content-primary pt-4 pb-1 ${isQuestion ? 'text-brand flex items-start gap-2 bg-brand-subtle/50 p-3 rounded-xl border border-brand-border/50' : ''}`}>
                    {isQuestion && <HelpCircle className="w-4 h-4 text-brand shrink-0 mt-0.5" />}
                    <span>{children}</span>
                  </h3>
                );
              },
              p: ({ children }) => (
                <p className="text-sm sm:text-base text-content-secondary leading-relaxed mb-4">
                  {children}
                </p>
              ),
              blockquote: ({ children }) => (
                <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-brand-subtle to-purple-50/40 border-l-4 border-brand border-y border-r border-brand-border/60 text-xs sm:text-sm text-purple-950 font-sans leading-relaxed shadow-sm flex items-start gap-3">
                  <Atom className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <div className="space-y-1">{children}</div>
                </div>
              ),
              table: ({ children }) => (
                <div className="my-6 overflow-x-auto rounded-2xl border border-brand-border shadow-sm">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#FAF8FD] font-orbitron font-bold text-xs text-content-primary border-b border-brand-border">
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="py-3 px-4 font-semibold text-brand tracking-wider">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="py-3 px-4 border-b border-brand-border/40 text-content-secondary">
                  {children}
                </td>
              ),
              ul: ({ children }) => (
                <ul className="list-none space-y-2.5 my-4 pl-1 text-sm sm:text-base">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal space-y-2.5 my-4 pl-6 text-sm sm:text-base text-content-secondary">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-2.5 text-content-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0 mt-2" />
                  <div className="flex-1">{children}</div>
                </li>
              ),
              img: ({ src, alt }) => {
                if (!src) return null;
                return (
                  <figure className="my-8 space-y-2">
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border-2 border-brand-border shadow-md bg-[#FAF8FD]">
                      <Image
                        src={src}
                        alt={alt || 'Peptide Research Graphic'}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 100vw, 800px"
                      />
                    </div>
                    {alt && (
                      <figcaption className="text-center text-xs font-orbitron text-content-muted tracking-wide pt-1">
                        {alt}
                      </figcaption>
                    )}
                  </figure>
                );
              },
              hr: () => (
                <hr className="my-8 border-t border-brand-border/80" />
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-content-primary">
                  {children}
                </strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand hover:underline inline-flex items-center gap-0.5 font-medium"
                >
                  {children}
                  <ExternalLink className="w-3 h-3 ml-0.5 inline" />
                </a>
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Table of Contents / Article Outline (Right Side - Sticky on Desktop) */}
        {tableOfContents.length > 0 && (
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4 p-5 rounded-2xl bg-[#FAF8FD] border border-brand-border/80 shadow-sm">
            <div className="flex items-center gap-2 font-orbitron text-xs font-bold text-content-primary tracking-wider border-b border-brand-border/60 pb-2">
              <ListOrdered className="w-4 h-4 text-brand" />
              ARTICLE OUTLINE
            </div>
            <nav className="space-y-1.5 text-xs">
              {tableOfContents.map((heading, i) => (
                <a
                  key={i}
                  href={`#${heading.id}`}
                  className="block py-1 px-2.5 rounded-lg text-content-secondary hover:text-brand hover:bg-brand-light/60 transition-colors truncate font-medium"
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>

      {/* 5. Topic Tags & Scientific Disclaimer */}
      <div className="space-y-6 pt-6 border-t border-brand-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-orbitron text-xs font-bold text-content-muted mr-1">TOPIC TAGS:</span>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full bg-brand-subtle border border-brand-border text-xs font-mono text-content-primary font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Research Use Only Alert */}
        <div className="p-6 rounded-3xl bg-purple-50 border border-purple-200 flex items-start space-x-3 text-xs text-purple-950 font-sans leading-relaxed shadow-sm">
          <ShieldAlert className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <div>
            <strong className="font-orbitron text-brand block mb-1 tracking-wide">
              EDUCATIONAL & LABORATORY RESEARCH NOTICE
            </strong>
            This monograph is synthesized exclusively for academic education and laboratory chemical reference. All chemical sequences and peptide compounds discussed are formulated strictly for in vitro and in vivo scientific experimentation. Peptra Bio does not formulate, supply, or endorse materials for human or animal clinical use.
          </div>
        </div>
      </div>

      {/* 6. Related Research Articles */}
      {relatedPosts.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-brand-border">
          <div className="flex justify-between items-center">
            <h2 className="font-orbitron font-bold text-xl text-content-primary">
              RELATED RESEARCH GUIDES
            </h2>
            <Link href="/blog" className="text-xs font-orbitron font-semibold text-brand hover:underline">
              View All Articles →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((rel) => (
              <BlogCard key={rel.id} post={rel} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
