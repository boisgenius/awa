'use client';

import Link from 'next/link';
import { Card, Badge, Button } from '@/components/ui';
import type { Skill } from '@/lib/skills';

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant={skill.status === 'live' ? 'live' : 'dev'}>
              {skill.status}
            </Badge>
            <Badge variant={skill.priority as 'high' | 'medium' | 'emerging'}>
              {skill.priority}
            </Badge>
          </div>
          {skill.verified && (
            <svg
              className="h-5 w-5 text-accent-secondary"
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

        {/* Title & Description */}
        <Link href={`/skills/${skill.id}`}>
          <h3 className="text-lg font-semibold text-text-primary hover:text-crimson transition-colors mb-2">
            {skill.name}
          </h3>
        </Link>
        <p className="text-sm text-text-secondary line-clamp-2 mb-4">
          {skill.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-1 mb-4">
          {skill.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="px-2 py-0.5 text-xs rounded-full bg-bg-tertiary text-text-muted"
            >
              {feature}
            </span>
          ))}
          {skill.features.length > 3 && (
            <span className="px-2 py-0.5 text-xs rounded-full bg-bg-tertiary text-text-muted">
              +{skill.features.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-text-muted">
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{skill.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>{skill.downloads.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-0 border-t border-border-default mt-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-text-primary">
              {skill.price} SOL
            </span>
          </div>
          <Button size="sm">Get Skill</Button>
        </div>
      </div>
    </Card>
  );
}
