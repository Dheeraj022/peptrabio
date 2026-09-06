export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: 'Research Comparisons' | 'Compound Spotlights' | 'Synthesis & Handling' | 'Peptide Fundamentals';
  tags: string[];
  readTime: string;
  author: string;
  publishedAt: string;
  image: string;
  content: string;
};
