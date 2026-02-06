'use client';

import { useState } from 'react';
import { SkillGrid, FilterBar, StatsBar } from '@/components/features';
import type { Skill, SkillCategory } from '@/lib/skills';

// Mock data for development
const mockSkills: Skill[] = [
  {
    id: '1',
    name: 'Web Research Pro',
    slug: 'web-research-pro',
    authorId: 'ClawCore',
    description: 'Advanced web research and information gathering capabilities with multi-source verification.',
    category: 'research',
    status: 'live',
    priority: 'high',
    price: 0.5,
    rating: 4.8,
    ratingCount: 156,
    downloads: 2340,
    verified: true,
    features: ['Search', 'Summarize', 'Extract', 'Verify'],
    content: '',
    version: '2.1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Code Review Assistant',
    slug: 'code-review-assistant',
    authorId: 'DevOpsAgent',
    description: 'Automated code review with best practices enforcement and security vulnerability detection.',
    category: 'coding',
    status: 'live',
    priority: 'high',
    price: 0.8,
    rating: 4.9,
    ratingCount: 89,
    downloads: 1560,
    verified: true,
    features: ['Review', 'Security', 'Performance', 'Style'],
    content: '',
    version: '1.5.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Financial Analyst',
    slug: 'financial-analyst',
    authorId: 'DeFiMaster',
    description: 'Comprehensive financial analysis including market trends, risk assessment, and portfolio optimization.',
    category: 'finance',
    status: 'live',
    priority: 'medium',
    price: 1.2,
    rating: 4.6,
    ratingCount: 67,
    downloads: 890,
    verified: true,
    features: ['Analysis', 'Forecasting', 'Risk Assessment'],
    content: '',
    version: '1.2.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Security Scanner',
    slug: 'security-scanner',
    authorId: 'SecureAI',
    description: 'Automated security vulnerability scanning and penetration testing toolkit.',
    category: 'security',
    status: 'dev',
    priority: 'emerging',
    price: 0.6,
    rating: 4.3,
    ratingCount: 23,
    downloads: 340,
    verified: false,
    features: ['Scan', 'Pentest', 'Report'],
    content: '',
    version: '0.9.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    name: 'Creative Writer',
    slug: 'creative-writer',
    authorId: 'CreativeAI',
    description: 'AI-powered creative writing assistant for stories, scripts, and marketing copy.',
    category: 'creative',
    status: 'live',
    priority: 'medium',
    price: 0.4,
    rating: 4.7,
    ratingCount: 112,
    downloads: 1890,
    verified: true,
    features: ['Stories', 'Scripts', 'Copy', 'Editing'],
    content: '',
    version: '2.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    name: 'Communication Hub',
    slug: 'communication-hub',
    authorId: 'CommBot',
    description: 'Multi-platform communication management with automated responses and scheduling.',
    category: 'comms',
    status: 'live',
    priority: 'high',
    price: 0.7,
    rating: 4.5,
    ratingCount: 78,
    downloads: 1200,
    verified: true,
    features: ['Email', 'Chat', 'Schedule', 'Templates'],
    content: '',
    version: '1.8.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function MarketplacePage() {
  const [category, setCategory] = useState<SkillCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState('trending');

  // Filter skills
  const filteredSkills = mockSkills.filter((skill) => {
    if (category === 'all') return true;
    return skill.category === category;
  });

  // Sort skills
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.createdAt.getTime() - a.createdAt.getTime();
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return b.downloads - a.downloads;
      default: // trending
        return b.downloads * b.rating - a.downloads * a.rating;
    }
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative mb-6 overflow-hidden">
        {/* Glow Effect */}
        <div
          className="absolute -top-[150px] -right-[150px] w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(228, 15, 58, 0.2) 0%, transparent 70%)',
          }}
        />

        {/* Badge */}
        <span className="inline-block bg-crimson/15 border border-crimson text-crimson px-4 py-2 rounded-full text-xs font-medium mb-5">
          Powered by OpenClaw
        </span>

        {/* Title */}
        <h1 className="text-[clamp(28px,4vw,40px)] font-bold mb-3 font-sans leading-tight">
          Train Your AI Agent <span className="text-crimson">Like Never Before</span>
        </h1>

        {/* Description */}
        <p className="text-base text-text-secondary max-w-[600px] leading-relaxed">
          The premier marketplace for AI agent skills, prompts, and educational modules.
        </p>
      </div>

      {/* Stats Bar */}
      <StatsBar />

      {/* Filters */}
      <FilterBar
        selectedCategory={category}
        onCategoryChange={setCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Skills Grid */}
      <SkillGrid skills={sortedSkills} />

      {/* Load More Button */}
      <div className="text-center py-5 mb-6">
        <button className="bg-bg-secondary border border-border-default text-text-secondary px-8 py-4 rounded-lg text-sm font-medium transition-all hover:border-crimson hover:text-crimson">
          Load More Skills ↓
        </button>
      </div>
    </div>
  );
}
