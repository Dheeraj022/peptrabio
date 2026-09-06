'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types/blog';
import { Clock, User, ArrowRight } from 'lucide-react';

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white border border-brand-border hover:border-brand rounded-3xl p-5 shadow-sm hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Featured Image */}
        <div className="relative w-full aspect-[16/10] bg-[#FAF8FD] rounded-2xl overflow-hidden border border-brand-border/60 mb-4 group-hover:border-brand-border-strong transition-colors">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-brand border border-brand-border text-[10px] font-orbitron font-bold rounded-full shadow-sm">
              {post.category.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex items-center space-x-3 text-[11px] text-content-muted font-sans mb-2">
          <span className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-brand" />
            {post.readTime}
          </span>
          <span>•</span>
          <span className="flex items-center truncate max-w-[140px]">
            <User className="w-3.5 h-3.5 mr-1 text-brand" />
            {post.author}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-orbitron font-bold text-base text-content-primary group-hover:text-brand leading-snug mb-2 line-clamp-2 transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-content-secondary font-sans leading-relaxed line-clamp-3 mb-4">
          {post.excerpt}
        </p>
      </div>

      {/* Footer / Read Link */}
      <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] font-mono text-content-muted bg-brand-subtle px-2 py-0.5 rounded">
              #{t}
            </span>
          ))}
        </div>

        <span className="inline-flex items-center text-xs font-orbitron font-semibold text-brand group-hover:text-brand-dark">
          <span>READ ARTICLE</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
