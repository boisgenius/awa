// Shared mock data for all pages
import type { SkillCategory, SkillPriority, SkillStatus } from './types';

export interface MockSkill {
  id: number;
  name: string;
  slug: string;
  author: string;
  emoji: string;
  gradient: string;
  description: string;
  category: SkillCategory;
  status: SkillStatus;
  priority: SkillPriority;
  price: number;
  rating: number;
  ratingCount: number;
  downloads: number;
  verified: boolean;
  starred: boolean;
  features: string[];
  version: string;
  lastUpdated: string;
  trendingScore: number;
  change24h: number;
  change7d: number;
  change30d: number;
  requirements: string[];
  changelog: { version: string; date: string; changes: string }[];
}

export const mockSkills: MockSkill[] = [
  {
    id: 1,
    name: 'Research Master Pro',
    slug: 'research-master-pro',
    author: 'ClawCore',
    emoji: '🔬',
    gradient: 'linear-gradient(135deg, #E40F3A, #770524)',
    description: 'Advanced research techniques including web scraping, data synthesis, and academic citations. Enables AI agents to perform comprehensive web searches, extract relevant information, and synthesize findings into structured reports.',
    category: 'research',
    status: 'live',
    priority: 'high',
    price: 0.5,
    rating: 4.8,
    ratingCount: 156,
    downloads: 2847,
    verified: true,
    starred: false,
    features: ['Web Scraping', 'Data Synthesis', 'Citations', 'Multi-source Search', 'Report Generation'],
    version: '2.1.0',
    lastUpdated: '2024-01-15',
    trendingScore: 95,
    change24h: 12.4,
    change7d: 127.4,
    change30d: 245.0,
    requirements: ['Internet access', 'API rate limits apply'],
    changelog: [
      { version: '2.1.0', date: '2024-01-15', changes: 'Added fact verification module' },
      { version: '2.0.0', date: '2024-01-01', changes: 'Major rewrite with improved accuracy' },
      { version: '1.5.0', date: '2023-12-15', changes: 'Added multi-language support' },
    ],
  },
  {
    id: 2,
    name: 'Trading Strategist',
    slug: 'trading-strategist',
    author: 'DeFiMaster',
    emoji: '📈',
    gradient: 'linear-gradient(135deg, #00FF88, #00CC6A)',
    description: 'Comprehensive crypto trading strategies with risk management and on-chain analysis. Provides real-time market insights and portfolio optimization recommendations.',
    category: 'finance',
    status: 'live',
    priority: 'high',
    price: 0.8,
    rating: 4.9,
    ratingCount: 203,
    downloads: 1923,
    verified: true,
    starred: true,
    features: ['DeFi', 'Risk Mgmt', 'On-chain', 'Portfolio Optimization', 'Market Analysis'],
    version: '3.0.1',
    lastUpdated: '2024-01-12',
    trendingScore: 92,
    change24h: 8.7,
    change7d: 234.7,
    change30d: 312.0,
    requirements: ['Internet access', 'Market data API key'],
    changelog: [
      { version: '3.0.1', date: '2024-01-12', changes: 'Fixed risk calculation edge case' },
      { version: '3.0.0', date: '2024-01-05', changes: 'Added on-chain analysis module' },
    ],
  },
  {
    id: 3,
    name: 'Code Assistant v3',
    slug: 'code-assistant-v3',
    author: 'DevOpsAgent',
    emoji: '💻',
    gradient: 'linear-gradient(135deg, #7C3AED, #A855F7)',
    description: 'Full-stack development skills including testing, deployment, and code review. Supports multiple languages and frameworks with intelligent code suggestions.',
    category: 'coding',
    status: 'live',
    priority: 'medium',
    price: 0.3,
    rating: 4.7,
    ratingCount: 312,
    downloads: 3421,
    verified: true,
    starred: false,
    features: ['Full-stack', 'Testing', 'CI/CD', 'Code Review', 'Multi-language'],
    version: '3.2.0',
    lastUpdated: '2024-01-10',
    trendingScore: 78,
    change24h: -2.3,
    change7d: 42.8,
    change30d: 89.5,
    requirements: ['Internet access'],
    changelog: [
      { version: '3.2.0', date: '2024-01-10', changes: 'Added Rust and Go support' },
      { version: '3.1.0', date: '2024-01-02', changes: 'Improved test generation accuracy' },
    ],
  },
  {
    id: 4,
    name: 'Security Guardian',
    slug: 'security-guardian',
    author: 'SecureAI',
    emoji: '🛡️',
    gradient: 'linear-gradient(135deg, #FF6B00, #FF8533)',
    description: 'Prompt injection defense, security auditing, and vulnerability scanning. Protects AI agents from adversarial attacks and ensures safe operation.',
    category: 'security',
    status: 'live',
    priority: 'high',
    price: 1.0,
    rating: 4.9,
    ratingCount: 89,
    downloads: 1800,
    verified: true,
    starred: false,
    features: ['Injection Defense', 'Auditing', 'Vulnerability Scanning', 'Threat Detection'],
    version: '1.8.0',
    lastUpdated: '2024-01-14',
    trendingScore: 88,
    change24h: 15.2,
    change7d: 89.1,
    change30d: 156.0,
    requirements: ['Internet access', 'Security policy config'],
    changelog: [
      { version: '1.8.0', date: '2024-01-14', changes: 'Added real-time threat monitoring' },
      { version: '1.7.0', date: '2024-01-03', changes: 'Improved prompt injection detection' },
    ],
  },
  {
    id: 5,
    name: 'Content Creator Kit',
    slug: 'content-creator-kit',
    author: 'CreativeAI',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, #FFD93D, #FFC107)',
    description: 'Social media content generation, image prompts, and video scripts. Create engaging content across multiple platforms with AI-powered creativity.',
    category: 'creative',
    status: 'live',
    priority: 'emerging',
    price: 0.4,
    rating: 4.6,
    ratingCount: 134,
    downloads: 987,
    verified: true,
    starred: false,
    features: ['Social Media', 'Scripts', 'Image Prompts', 'Content Calendar'],
    version: '2.0.0',
    lastUpdated: '2024-01-08',
    trendingScore: 72,
    change24h: -5.4,
    change7d: -8.2,
    change30d: 34.0,
    requirements: ['Internet access'],
    changelog: [
      { version: '2.0.0', date: '2024-01-08', changes: 'Added video script generation' },
      { version: '1.5.0', date: '2023-12-20', changes: 'Multi-platform support' },
    ],
  },
  {
    id: 6,
    name: 'Email Composer Pro',
    slug: 'email-composer-pro',
    author: 'CommBot',
    emoji: '✉️',
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    description: 'Professional email writing with tone adaptation and smart follow-ups. Crafts context-aware emails that match your communication style.',
    category: 'comms',
    status: 'dev',
    priority: 'medium',
    price: 0.2,
    rating: 4.5,
    ratingCount: 67,
    downloads: 650,
    verified: false,
    starred: false,
    features: ['Tone Analysis', 'Templates', 'Follow-ups', 'Smart Scheduling'],
    version: '1.2.0',
    lastUpdated: '2024-01-06',
    trendingScore: 55,
    change24h: 3.1,
    change7d: 18.4,
    change30d: 45.0,
    requirements: ['Email API access'],
    changelog: [
      { version: '1.2.0', date: '2024-01-06', changes: 'Added smart follow-up suggestions' },
      { version: '1.1.0', date: '2023-12-28', changes: 'Improved tone detection' },
    ],
  },
  {
    id: 7,
    name: 'Data Pipeline Builder',
    slug: 'data-pipeline-builder',
    author: 'DataFlow',
    emoji: '🔧',
    gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)',
    description: 'Build and manage data pipelines with automated ETL processes. Supports multiple data sources and provides monitoring dashboards.',
    category: 'coding',
    status: 'live',
    priority: 'high',
    price: 0.6,
    rating: 4.7,
    ratingCount: 98,
    downloads: 1245,
    verified: true,
    starred: false,
    features: ['ETL', 'Monitoring', 'Multi-source', 'Scheduling'],
    version: '2.3.0',
    lastUpdated: '2024-01-11',
    trendingScore: 81,
    change24h: 6.8,
    change7d: 52.3,
    change30d: 120.0,
    requirements: ['Database access', 'Cloud credentials'],
    changelog: [
      { version: '2.3.0', date: '2024-01-11', changes: 'Added real-time streaming support' },
    ],
  },
  {
    id: 8,
    name: 'Market Analyzer',
    slug: 'market-analyzer',
    author: 'QuantAI',
    emoji: '📊',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    description: 'Advanced market analysis with sentiment tracking and predictive modeling. Analyzes trends across multiple financial markets.',
    category: 'finance',
    status: 'live',
    priority: 'medium',
    price: 0.7,
    rating: 4.6,
    ratingCount: 112,
    downloads: 1567,
    verified: true,
    starred: false,
    features: ['Sentiment Analysis', 'Predictions', 'Multi-market', 'Alerts'],
    version: '1.9.0',
    lastUpdated: '2024-01-09',
    trendingScore: 69,
    change24h: -1.2,
    change7d: 28.5,
    change30d: 67.0,
    requirements: ['Market data API key'],
    changelog: [
      { version: '1.9.0', date: '2024-01-09', changes: 'Added crypto market support' },
    ],
  },
  {
    id: 9,
    name: 'Threat Intelligence',
    slug: 'threat-intelligence',
    author: 'CyberShield',
    emoji: '🔒',
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    description: 'Real-time threat intelligence gathering and analysis. Monitors security feeds, CVE databases, and provides actionable security recommendations.',
    category: 'security',
    status: 'live',
    priority: 'emerging',
    price: 0.9,
    rating: 4.8,
    ratingCount: 45,
    downloads: 890,
    verified: true,
    starred: false,
    features: ['CVE Monitoring', 'Threat Feeds', 'Risk Assessment', 'Reporting'],
    version: '1.4.0',
    lastUpdated: '2024-01-13',
    trendingScore: 84,
    change24h: 22.1,
    change7d: 95.6,
    change30d: 178.0,
    requirements: ['Internet access', 'Security clearance recommended'],
    changelog: [
      { version: '1.4.0', date: '2024-01-13', changes: 'Added automated risk scoring' },
    ],
  },
  {
    id: 10,
    name: 'Academic Writer',
    slug: 'academic-writer',
    author: 'ScholarBot',
    emoji: '📝',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    description: 'Academic paper writing assistant with citation management and formatting. Supports APA, MLA, Chicago, and IEEE citation styles.',
    category: 'research',
    status: 'live',
    priority: 'medium',
    price: 0.4,
    rating: 4.5,
    ratingCount: 178,
    downloads: 2100,
    verified: true,
    starred: false,
    features: ['Citation Mgmt', 'Formatting', 'Peer Review', 'Bibliography'],
    version: '2.5.0',
    lastUpdated: '2024-01-07',
    trendingScore: 65,
    change24h: 1.8,
    change7d: 15.2,
    change30d: 42.0,
    requirements: ['Internet access'],
    changelog: [
      { version: '2.5.0', date: '2024-01-07', changes: 'Added IEEE citation format' },
    ],
  },
];

// Category metadata
export const categoryMeta: Record<string, { label: string; emoji: string }> = {
  research: { label: 'Research', emoji: '🔬' },
  finance: { label: 'Finance', emoji: '📈' },
  coding: { label: 'Coding', emoji: '💻' },
  security: { label: 'Security', emoji: '🛡️' },
  creative: { label: 'Creative', emoji: '🎨' },
  comms: { label: 'Comms', emoji: '✉️' },
};

// Filter skills by category, search term, and sort order
export function filterSkills(
  skills: MockSkill[],
  options: {
    category?: string;
    search?: string;
    sort?: string;
  }
): MockSkill[] {
  let result = [...skills];

  // Filter by category
  if (options.category && options.category !== 'all') {
    result = result.filter((s) => s.category === options.category);
  }

  // Filter by search
  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.author.toLowerCase().includes(q) ||
        s.features.some((f) => f.toLowerCase().includes(q))
    );
  }

  // Sort
  switch (options.sort) {
    case 'newest':
      result.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      break;
    case 'downloads':
      result.sort((a, b) => b.downloads - a.downloads);
      break;
    case 'rating':
      result.sort((a, b) => b.rating - a.rating);
      break;
    case 'trending':
    default:
      result.sort((a, b) => b.trendingScore - a.trendingScore);
      break;
  }

  return result;
}

// Get leaderboard data for a time range
export function getLeaderboardData(skills: MockSkill[], timeRange: string) {
  const sorted = [...skills].sort((a, b) => {
    switch (timeRange) {
      case '7D':
        return Math.abs(b.change7d) - Math.abs(a.change7d);
      case '30D':
        return Math.abs(b.change30d) - Math.abs(a.change30d);
      case 'All':
        return b.downloads - a.downloads;
      case '24H':
      default:
        return Math.abs(b.change24h) - Math.abs(a.change24h);
    }
  });

  return sorted.map((skill, index) => ({
    rank: index + 1,
    name: skill.name,
    id: skill.id,
    emoji: skill.emoji,
    gradient: skill.gradient,
    category: categoryMeta[skill.category]?.label || skill.category,
    change24h: skill.change24h,
    change7d: skill.change7d,
    change30d: skill.change30d,
    downloads: skill.downloads,
    verified: skill.verified,
  }));
}

// Get dynamic category counts
export function getCategoryCounts(skills: MockSkill[]) {
  const counts: Record<string, number> = { all: skills.length };
  for (const skill of skills) {
    counts[skill.category] = (counts[skill.category] || 0) + 1;
  }
  return counts;
}

// Find a skill by ID
export function findSkillById(id: number | string): MockSkill | undefined {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id;
  return mockSkills.find((s) => s.id === numId);
}
