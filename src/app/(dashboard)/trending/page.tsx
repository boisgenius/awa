'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { mockSkills, filterSkills } from '@/lib/skills/mock-data';

export default function TrendingPage() {
  return <Suspense><TrendingContent /></Suspense>;
}

function TrendingContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const skills = useMemo(
    () => filterSkills(mockSkills, { search: searchQuery, sort: 'trending' }),
    [searchQuery]
  );

  return (
    <section className="marketplace-section">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Trending Skills</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Skills gaining the most traction right now
        </p>
      </div>

      {searchQuery && (
        <div style={{ padding: '0 0 16px', color: 'var(--text-secondary)', fontSize: 14 }}>
          Showing results for &quot;{searchQuery}&quot; — {skills.length} skill{skills.length !== 1 ? 's' : ''} found
        </div>
      )}

      <div className="skills-grid">
        {skills.map((skill) => {
          const statusClass = skill.status === 'live' ? 'badge-live' : 'badge-dev';
          const statusText = skill.status === 'live' ? 'LIVE' : 'IN DEV';

          return (
            <article key={skill.id} className="skill-card">
              <div className="skill-header">
                <div className="skill-icon" style={{ background: skill.gradient }}>
                  {skill.emoji}
                </div>
                <div className="skill-actions">
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    Score: {skill.trendingScore}
                  </span>
                </div>
              </div>
              <Link href={`/skills/${skill.id}`}>
                <h3 className="skill-title">
                  {skill.name}
                  {skill.verified && <span className="verified-badge">✓</span>}
                </h3>
              </Link>
              <span className="skill-author">by {skill.author}</span>
              <p className="skill-desc">{skill.description}</p>
              <div className="skill-badges">
                <span className={`badge ${statusClass}`}>{statusText}</span>
                <span className="badge" style={{ background: skill.change24h >= 0 ? 'rgba(0,255,136,0.15)' : 'rgba(255,68,68,0.15)', color: skill.change24h >= 0 ? '#00FF88' : '#FF4444' }}>
                  {skill.change24h >= 0 ? '+' : ''}{skill.change24h}% 24H
                </span>
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

      {skills.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No skills found</h3>
          <p>Try adjusting your search.</p>
        </div>
      )}
    </section>
  );
}
