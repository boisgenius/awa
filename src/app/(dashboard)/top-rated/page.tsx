'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { categoryGradients } from '@/lib/skills/category-meta';

export default function TopRatedPage() {
  return <Suspense><TopRatedContent /></Suspense>;
}

interface SkillItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  rating: number;
  ratingCount?: number;
  downloads: number;
  verified: boolean;
  features: string[];
  iconEmoji?: string;
  authorName?: string;
}

function TopRatedContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopRated() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('sort', 'rating');
        params.set('status', 'live');
        if (searchQuery) params.set('search', searchQuery);
        params.set('limit', '20');

        const res = await fetch(`/api/skills?${params}`);
        const data = await res.json();
        setSkills(data.data || []);
      } catch (err) {
        console.error('Failed to fetch top rated skills:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTopRated();
  }, [searchQuery]);

  return (
    <section className="marketplace-section">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Top Rated Skills</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Highest rated skills by the community
        </p>
      </div>

      {searchQuery && (
        <div style={{ padding: '0 0 16px', color: 'var(--text-secondary)', fontSize: 14 }}>
          Showing results for &quot;{searchQuery}&quot; — {skills.length} skill{skills.length !== 1 ? 's' : ''} found
        </div>
      )}

      {loading && skills.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 24 }}>Loading...</div>
        </div>
      )}

      <div className="skills-grid">
        {skills.map((skill) => {
          const statusClass = skill.status === 'live' ? 'badge-live' : 'badge-dev';
          const statusText = skill.status === 'live' ? 'LIVE' : 'IN DEV';

          return (
            <article key={skill.id} className="skill-card">
              <div className="skill-header">
                <div className="skill-icon" style={{ background: categoryGradients[skill.category] || categoryGradients.coding }}>
                  {skill.iconEmoji || '📦'}
                </div>
                <div className="skill-actions">
                  <span style={{ color: '#FFD93D', fontSize: 14 }}>
                    ★ {skill.rating}
                  </span>
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
              </div>
              <div className="skill-features">
                {skill.features.slice(0, 3).map((f) => (
                  <span key={f} className="feature-tag">{f}</span>
                ))}
              </div>
              <div className="skill-footer">
                <div className="skill-stats">
                  <span className="skill-stat"><span className="star">★</span> {skill.rating}{skill.ratingCount ? ` (${skill.ratingCount})` : ''}</span>
                  <span className="skill-stat">↓ {skill.downloads.toLocaleString()}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && skills.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No skills found</h3>
          <p>Try adjusting your search.</p>
        </div>
      )}
    </section>
  );
}
