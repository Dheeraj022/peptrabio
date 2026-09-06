'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllBlogPosts, getBlogCategories } from '@/lib/blog-data';
import { BlogCard } from '@/components/blog/BlogCard';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Clock,
  User,
  ShieldCheck,
  X
} from 'lucide-react';

export default function BlogHubPage() {
  const allPosts = getAllBlogPosts();
  const categories = getBlogCategories();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      if (selectedCategory !== 'All' && post.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = post.title.toLowerCase().includes(q);
        const matchExcerpt = post.excerpt.toLowerCase().includes(q);
        const matchTags = post.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchExcerpt && !matchTags) return false;
      }
      return true;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  const featuredPost = allPosts[0];
  const gridPosts = selectedCategory === 'All' && !searchQuery
    ? filteredPosts.slice(1)
    : filteredPosts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-light text-brand text-xs font-orbitron font-semibold tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>SCIENTIFIC DISCOURSE & INSIGHTS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-orbitron font-extrabold tracking-tight">
          PEPTIDE RESEARCH BLOG & GUIDES
        </h1>
        <p className="text-xs sm:text-base text-content-secondary font-sans leading-relaxed">
          Comprehensive scientific guides, comparative receptor pathway analyses, molecular pharmacokinetics, and peptide reconstitution protocols written for researchers.
        </p>
      </div>

      {/* Control Bar: Search & Category Pills */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-brand absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search research topics, sequences, comparison guides..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-brand-border rounded-full text-xs font-sans text-content-primary placeholder-content-muted focus:outline-none focus:border-brand shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-content-muted hover:text-content-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full font-orbitron text-xs font-semibold tracking-wider transition-all ${
                  active
                    ? 'bg-brand text-white shadow-purple-sm'
                    : 'bg-white border border-brand-border text-content-secondary hover:border-brand hover:text-brand'
                }`}
              >
                {cat.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Lead Article (when on All and no search) */}
      {selectedCategory === 'All' && !searchQuery && featuredPost && (
        <Link
          href={`/blog/${featuredPost.slug}`}
          className="block bg-[#120B1D] text-white rounded-3xl overflow-hidden border border-purple-900/60 shadow-2xl group cursor-pointer hover:border-purple-600/80 transition-all duration-300"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-10">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-brand text-white font-orbitron text-xs font-bold rounded-full">
                  FEATURED RESEARCH GUIDE
                </span>
                <span className="text-xs text-purple-300 font-mono">{featuredPost.readTime}</span>
              </div>

              <h2 className="font-orbitron font-bold text-2xl sm:text-3xl leading-tight group-hover:text-purple-300 transition-colors">
                {featuredPost.title}
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
                {featuredPost.excerpt}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-400 font-sans">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span>{featuredPost.author}</span>
                </div>

                <span className="px-6 py-2.5 bg-brand group-hover:bg-brand-dark text-white font-orbitron text-xs font-semibold rounded-full shadow-purple-glow flex items-center space-x-1.5 transition-all">
                  <span>READ FULL GUIDE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-purple-800/60">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

          </div>
        </Link>
      )}

      {/* Grid of Articles */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-xs text-content-muted font-sans border-b border-brand-border/40 pb-2">
          <span>
            Displaying <strong className="text-brand font-orbitron">{gridPosts.length}</strong> scientific research articles
          </span>
        </div>

        {gridPosts.length === 0 ? (
          <div className="text-center py-16 bg-white border border-brand-border rounded-3xl p-8 space-y-3">
            <h3 className="font-orbitron font-bold text-lg text-content-primary">
              NO ARTICLES FOUND
            </h3>
            <p className="text-xs text-content-secondary">
              Try adjusting your keywords or switch category filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gridPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
