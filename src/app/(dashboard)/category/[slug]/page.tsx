'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { categoryMeta, categoryGradients } from '@/lib/skills/category-meta';

export default function CategoryPage() {
  return <Suspense><CategoryContent /></Suspense>;
}

interface SkillItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  priority?: string;
  rating: number;
  downloads: number;
  verified: boolean;
  features: string[];
  iconEmoji?: string;
  authorName?: string;
}

function CategoryContent() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const meta = categoryMeta[slug];
  const categoryTitle = meta ? `${meta.emoji} ${meta.label}` : slug;

  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategory() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('category', slug);
        params.set('sort', 'trending');
        if (searchQuery) params.set('search', searchQuery);
        params.set('limit', '20');

        const res = await fetch(`/api/skills?${params}`);
        const data = await res.json();
        setSkills(data.data || []);
      } catch (err) {
        console.error('Failed to fetch category skills:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategory();
  }, [slug, searchQuery]);

  if (!meta) {
    return (
      <section className="marketplace-section">
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Category not found</h3>
          <p>The category &quot;{slug}&quot; does not exist.</p>
          <Link href="/marketplace" style={{ color: 'var(--crimson)', marginTop: 16, display: 'inline-block' }}>
            Back to Marketplace
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="marketplace-section">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2 className="section-title">{categoryTitle}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          {skills.length} skill{skills.length !== 1 ? 's' : ''} in this category
        </p>
      </div>

      {searchQuery && (
        <div style={{ padding: '0 0 16px', color: 'var(--text-secondary)', fontSize: 14 }}>
          Showing results for &quot;{searchQuery}&quot;
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
          let priorityClass = 'badge-medium';
          if (skill.priority === 'high') priorityClass = 'badge-high';
          if (skill.priority === 'emerging') priorityClass = 'badge-emerging';

          return (
            <article key={skill.id} className="skill-card">
              <div className="skill-header">
                <div className="skill-icon" style={{ background: categoryGradients[skill.category] || categoryGradients.coding }}>
                  {skill.iconEmoji || '📦'}
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
