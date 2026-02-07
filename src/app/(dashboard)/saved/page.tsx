'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { categoryGradients } from '@/lib/skills/category-meta';

export default function SavedPage() {
  return <Suspense><SavedContent /></Suspense>;
}

interface SkillItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: string;
  rating: number;
  downloads: number;
  verified: boolean;
  features: string[];
  iconEmoji?: string;
  authorName?: string;
}

function SavedContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [starredIds, setStarredIds] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('awa-starred-skills');
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [];
  });

  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const removeStar = (id: string) => {
    setStarredIds((prev) => {
      const next = prev.filter((s) => s !== id);
      try {
        localStorage.setItem('awa-starred-skills', JSON.stringify(next));
      } catch {}
      return next;
    });
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  useEffect(() => {
    async function fetchSaved() {
      if (starredIds.length === 0) {
        setSkills([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/skills?ids=${starredIds.join(',')}`);
        const data = await res.json();
        let results: SkillItem[] = data.data || [];

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          results = results.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q)
          );
        }

        setSkills(results);
      } catch (err) {
        console.error('Failed to fetch saved skills:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
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

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 24 }}>Loading...</div>
        </div>
      )}

      {!loading && skills.length > 0 ? (
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
                    <span className="skill-stat"><span className="star">★</span> {skill.rating}</span>
                    <span className="skill-stat">↓ {skill.downloads.toLocaleString()}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : !loading ? (
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
      ) : null}
    </section>
  );
}
