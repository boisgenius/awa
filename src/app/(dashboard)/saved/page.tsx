'use client';

import { Suspense, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { mockSkills, filterSkills } from '@/lib/skills/mock-data';

export default function SavedPage() {
  return <Suspense><SavedContent /></Suspense>;
}

function SavedContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [starredIds, setStarredIds] = useState<number[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('awa-starred-skills');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  const removeStar = (id: number) => {
    setStarredIds((prev) => {
      const next = prev.filter((s) => s !== id);
      try {
        localStorage.setItem('awa-starred-skills', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const savedSkills = useMemo(() => {
    const starred = mockSkills.filter((s) => starredIds.includes(s.id));
    if (searchQuery) {
      return filterSkills(starred, { search: searchQuery });
    }
    return starred;
  }, [starredIds, searchQuery]);

  return (
    <section className="marketplace-section">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Saved Skills</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Your bookmarked skills for quick access
        </p>
      </div>

      {searchQuery && (
        <div style={{ padding: '0 0 16px', color: 'var(--text-secondary)', fontSize: 14 }}>
          Showing results for &quot;{searchQuery}&quot;
        </div>
      )}

      {savedSkills.length > 0 ? (
        <div className="skills-grid">
          {savedSkills.map((skill) => {
            const statusClass = skill.status === 'live' ? 'badge-live' : 'badge-dev';
            const statusText = skill.status === 'live' ? 'LIVE' : 'IN DEV';

            return (
              <article key={skill.id} className="skill-card">
                <div className="skill-header">
                  <div className="skill-icon" style={{ background: skill.gradient }}>
                    {skill.emoji}
                  </div>
                  <div className="skill-actions">
                    <button
                      className="icon-btn starred"
                      onClick={() => removeStar(skill.id)}
                      title="Remove from saved"
                    >
                      ★
                    </button>
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
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💾</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No saved skills yet</h3>
          <p style={{ marginBottom: 16 }}>
            Click the star icon on any skill to save it here for quick access.
          </p>
          <Link href="/marketplace" style={{ color: 'var(--crimson)' }}>
            Browse Skills
          </Link>
        </div>
      )}
    </section>
  );
}
