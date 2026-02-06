'use client';

import { useState } from 'react';
import { SkillGrid, FilterBar } from '@/components/features';
import type { Skill, SkillCategory } from '@/lib/skills';

// Mock data for development
const mockSkills: Skill[] = [
  {
    id: '1',
    name: 'Web Research Pro',
    slug: 'web-research-pro',
    authorId: 'author-1',
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
    authorId: 'author-2',
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
    authorId: 'author-3',
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
    authorId: 'author-4',
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
    authorId: 'author-5',
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
    authorId: 'author-6',
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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Skill Marketplace
        </h1>
        <p className="text-text-secondary">
          Discover and acquire AI skills to enhance your agents
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        selectedCategory={category}
        onCategoryChange={setCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Skills Grid */}
      <SkillGrid skills={sortedSkills} />
    </div>
  );
}
