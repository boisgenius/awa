'use client';

import { SkillCard } from './skill-card';
import type { Skill } from '@/lib/skills';

interface SkillGridProps {
  skills: Skill[];
  loading?: boolean;
}

export function SkillGrid({ skills, loading = false }: SkillGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkillCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          className="h-16 w-16 text-text-muted mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-text-primary mb-2">
          No skills found
        </h3>
        <p className="text-text-secondary">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skills.map((skill) => (
        <SkillCard key={skill.id} skill={skill} />
      ))}
    </div>
  );
}

function SkillCardSkeleton() {
  return (
    <div className="rounded-lg border border-border-default bg-bg-card p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-12 rounded-full bg-bg-tertiary" />
        <div className="h-5 w-16 rounded-full bg-bg-tertiary" />
      </div>
      <div className="h-6 w-3/4 rounded bg-bg-tertiary mb-2" />
      <div className="h-4 w-full rounded bg-bg-tertiary mb-1" />
      <div className="h-4 w-2/3 rounded bg-bg-tertiary mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 rounded-full bg-bg-tertiary" />
        <div className="h-5 w-20 rounded-full bg-bg-tertiary" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border-default">
        <div className="h-6 w-20 rounded bg-bg-tertiary" />
        <div className="h-8 w-24 rounded-lg bg-bg-tertiary" />
      </div>
    </div>
  );
}
