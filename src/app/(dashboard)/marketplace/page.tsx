'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { categoryMeta, categoryGradients } from '@/lib/skills/category-meta';
import { useTokenData } from '@/lib/token/use-token-data';
import { TOKEN_CONFIG } from '@/lib/token/config';

const ITEMS_PER_PAGE = 6;

const sortOptions = [
  { value: 'trending', label: 'Sort: Trending' },
  { value: 'newest', label: 'Sort: Newest' },
  { value: 'downloads', label: 'Sort: Most Downloads' },
  { value: 'rating', label: 'Sort: Highest Rated' },
];

export default function MarketplacePage() {
  return <Suspense><MarketplaceContent /></Suspense>;
}

function formatCompact(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toFixed(1);
}

interface SkillItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  priority?: string;
  price: number;
  rating: number;
  ratingCount?: number;
  downloads: number;
  verified: boolean;
  features: string[];
  version: string;
  iconEmoji?: string;
  authorName?: string;
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const { data: tokenData, loading: tokenLoading } = useTokenData();
  const tokenAvailable = tokenData?.available;
  const pumpUrl = TOKEN_CONFIG.mintAddress
    ? TOKEN_CONFIG.pumpFunUrl(TOKEN_CONFIG.mintAddress)
    : undefined;

  const [activeCategory, setActiveCategoryRaw] = useState('all');
  const [sortBy, setSortByRaw] = useState('trending');
  const [page, setPage] = useState(1);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({ all: 0 });
  const [loading, setLoading] = useState(true);
  const [prevSearch, setPrevSearch] = useState(searchQuery);

  if (prevSearch !== searchQuery) {
    setPrevSearch(searchQuery);
    setPage(1);
  }

  const setActiveCategory = (cat: string) => { setActiveCategoryRaw(cat); setPage(1); };
  const setSortBy = (sort: string) => { setSortByRaw(sort); setPage(1); };

  const [starredSkills, setStarredSkills] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('awa-starred-skills');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  const toggleStar = (id: string) => {
    setStarredSkills((prev) => {
      const next = prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id];
      try {
        localStorage.setItem('awa-starred-skills', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const fetchSkills = useCallback(async (pageNum: number, append: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);
      params.set('sort', sortBy);
      params.set('page', String(pageNum));
      params.set('limit', String(ITEMS_PER_PAGE));

      const res = await fetch(`/api/skills?${params}`);
      const data = await res.json();

      if (append) {
        setSkills(prev => [...prev, ...(data.data || [])]);
      } else {
        setSkills(data.data || []);
      }
      setTotalCount(data.total || 0);
      if (data.categoryCounts) {
        setCategoryCounts(data.categoryCounts);
      }
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, sortBy]);

  useEffect(() => {
    setPage(1);
    fetchSkills(1, false);
  }, [fetchSkills]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSkills(nextPage, true);
  };

  const hasMore = skills.length < totalCount;

  const categories = [
    { id: 'all', label: 'All', count: categoryCounts.all || 0 },
    ...Object.entries(categoryMeta).map(([id, meta]) => ({
      id,
      label: `${meta.emoji} ${meta.label}`,
      count: categoryCounts[id] || 0,
    })),
  ];

  return (
    <section className="marketplace-section">
      {/* Hero */}
      <div className="marketplace-hero">
        <span className="badge-powered">Powered by OpenClaw</span>
        <h2 className="marketplace-title">
          Train Your AI Agent <span className="highlight">Like Never Before</span>
        </h2>
        <p className="marketplace-desc">
          The premier marketplace for AI agent skills, prompts, and educational modules.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat">
          <div className="stat-label">Total Skills</div>
          <div className="stat-value">{totalCount}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Volume 24H</div>
          <div className="stat-value">
            {pumpUrl ? (
              <a href={pumpUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                {tokenLoading || !tokenAvailable ? '--' : `$${formatCompact(tokenData.volume24h)}`}
              </a>
            ) : (
              '--'
            )}
          </div>
        </div>
        <div className="stat">
          <div className="stat-label">Floor Price</div>
          <div className="stat-value">
            {pumpUrl ? (
              <a href={pumpUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                {tokenLoading || !tokenAvailable ? '--' : `$${tokenData.price < 0.01 ? tokenData.price.toPrecision(4) : tokenData.price.toFixed(4)}`}
              </a>
            ) : (
              '--'
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-pills">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label} <span className="count">{cat.count}</span>
            </button>
          ))}
        </div>
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Search indicator */}
      {searchQuery && (
        <div style={{ padding: '0 0 16px', color: 'var(--text-secondary)', fontSize: 14 }}>
          Showing results for &quot;{searchQuery}&quot; — {totalCount} skill{totalCount !== 1 ? 's' : ''} found
        </div>
      )}

      {/* Loading */}
      {loading && skills.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 24 }}>Loading skills...</div>
        </div>
      )}

      {/* Skills Grid */}
      <div className="skills-grid">
        {skills.map((skill) => {
          const isStarred = starredSkills.includes(skill.id);
          const statusClass = skill.status === 'live' ? 'badge-live' : 'badge-dev';
          const statusText = skill.status === 'live' ? 'LIVE' : 'IN DEV';
          let priorityClass = 'badge-medium';
          if (skill.priority === 'high') priorityClass = 'badge-high';
          if (skill.priority === 'emerging') priorityClass = 'badge-emerging';

          return (
            <article key={skill.id} className="skill-card">
              <div className="skill-header">
                <div className="skill-icon" style={{ background: categoryGradients[skill.category] || categoryGradients.coding }}>
                  {skill.iconEmoji || '📦'}
                </div>
                <div className="skill-actions">
                  <button
                    className={`icon-btn ${isStarred ? 'starred' : ''}`}
                    onClick={() => toggleStar(skill.id)}
                  >
                    {isStarred ? '★' : '☆'}
                  </button>
                  <button className="icon-btn">↗</button>
                </div>
              </div>
              <Link href={`/skills/${skill.id}`}>
                <h3 className="skill-title">
                  {skill.name}
                  {skill.verified && <span className="verified-badge">✓</span>}
                </h3>
              </Link>
              <span className="skill-author">by {skill.authorName || 'Unknown'}</span>
              <p className="skill-desc">{skill.description}</p>
              <div className="skill-badges">
                <span className={`badge ${statusClass}`}>{statusText}</span>
                {skill.priority && (
                  <span className={`badge ${priorityClass}`}>{skill.priority.toUpperCase()}</span>
                )}
              </div>
              <div className="skill-features">
                {skill.features.slice(0, 3).map((f) => (
                  <span key={f} className="feature-tag">{f}</span>
                ))}
              </div>
              <div className="skill-footer">
                <div className="skill-stats">
                  <span className="skill-stat"><span className="star">★</span> {skill.rating}</span>
                  <span className="skill-stat">↓ {skill.downloads.toLocaleString()}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Empty state */}
      {!loading && skills.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No skills found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="load-more">
          <button
            className="load-more-btn"
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Skills ↓'}
          </button>
        </div>
      )}
    </section>
  );
}
