'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, Badge, Button } from '@/components/ui';
import { categoryMeta, categoryGradients } from '@/lib/skills/category-meta';

interface SkillDetail {
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
  currency?: string;
  requirements?: string[];
  changelog?: { version: string; date: string; changes: string }[];
}

export default function SkillDetailPage() {
  const params = useParams();
  const skillId = params.id as string;

  const [skill, setSkill] = useState<SkillDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchSkill() {
      setLoading(true);
      try {
        const res = await fetch(`/api/skills/${skillId}`);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setSkill(data);
      } catch (err) {
        console.error('Failed to fetch skill:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchSkill();
  }, [skillId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 24 }}>Loading skill...</div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Skill not found</h3>
        <p style={{ marginBottom: 16 }}>The skill you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/marketplace" style={{ color: 'var(--crimson)' }}>
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const catMeta = categoryMeta[skill.category];
  const gradient = categoryGradients[skill.category] || categoryGradients.coding;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                {skill.iconEmoji || '📦'}
              </div>
              <h1 className="text-3xl font-bold text-text-primary">
                {skill.name}
              </h1>
              {skill.verified && (
                <svg
                  className="h-6 w-6 text-accent-secondary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <span>by {skill.authorName || 'Unknown'}</span>
              <span>·</span>
              <span>v{skill.version}</span>
              {catMeta && (
                <>
                  <span>·</span>
                  <Link href={`/category/${skill.category}`} style={{ color: 'var(--crimson)' }}>
                    {catMeta.emoji} {catMeta.label}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={skill.status === 'live' ? 'live' : 'dev'}>
              {skill.status}
            </Badge>
            {skill.priority && (
              <Badge variant={skill.priority as 'high' | 'medium' | 'emerging'}>
                {skill.priority}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <svg className="h-5 w-5 text-accent-warning" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="font-medium text-text-primary">{skill.rating}</span>
            {skill.ratingCount !== undefined && (
              <span className="text-text-muted">({skill.ratingCount} reviews)</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-text-muted">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{skill.downloads.toLocaleString()} downloads</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Description
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {skill.description}
              </p>
            </div>
          </Card>

          {/* Features */}
          {skill.features.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Features
                </h2>
                <ul className="space-y-2">
                  {skill.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-text-secondary">
                      <svg className="h-5 w-5 text-accent-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}

          {/* Changelog */}
          {skill.changelog && skill.changelog.length > 0 && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">
                  Changelog
                </h2>
                <div className="space-y-4">
                  {skill.changelog.map((entry) => (
                    <div key={entry.version} className="border-l-2 border-border-default pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-text-primary">v{entry.version}</span>
                        <span className="text-sm text-text-muted">{entry.date}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{entry.changes}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Purchase Card */}
          <Card>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-text-primary mb-1">
                  {skill.price} {skill.currency || 'SOL'}
                </div>
                <div className="text-sm text-text-muted">
                  ≈ ${(skill.price * 100).toFixed(2)}
                </div>
              </div>
              <Button className="w-full mb-3">Purchase Skill</Button>
              <Button variant="outline" className="w-full">
                Try Demo
              </Button>
            </div>
          </Card>

          {/* Requirements */}
          {skill.requirements && skill.requirements.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-text-primary mb-3">
                  Requirements
                </h3>
                <ul className="space-y-2 text-sm text-text-secondary">
                  {skill.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2">
                      <svg className="h-4 w-4 mt-0.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
