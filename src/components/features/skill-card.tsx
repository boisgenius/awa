'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, Badge, IconButton } from '@/components/ui';
import type { Skill } from '@/lib/skills';

// Category icon and gradient mapping
const categoryStyles: Record<string, { icon: string; gradient: string }> = {
  research: { icon: '🔬', gradient: 'linear-gradient(135deg, #E40F3A, #770524)' },
  finance: { icon: '📈', gradient: 'linear-gradient(135deg, #00FF88, #00CC6A)' },
  coding: { icon: '💻', gradient: 'linear-gradient(135deg, #7C3AED, #A855F7)' },
  security: { icon: '🛡️', gradient: 'linear-gradient(135deg, #FF6B00, #FF8533)' },
  creative: { icon: '🎨', gradient: 'linear-gradient(135deg, #FFD93D, #FFC107)' },
  comms: { icon: '✉️', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)' },
};

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const [isStarred, setIsStarred] = useState(false);
  const style = categoryStyles[skill.category] || categoryStyles.research;

  return (
    <Card className="flex flex-col h-full">
      <div className="p-5 flex-1">
        {/* Header with Icon and Actions */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-[52px] h-[52px] rounded-lg flex items-center justify-center text-[26px]"
            style={{ background: style.gradient }}
          >
            {style.icon}
          </div>
          <div className="flex gap-2">
            <IconButton
              aria-label={isStarred ? 'Remove from saved' : 'Save skill'}
              onClick={(e) => {
                e.preventDefault();
                setIsStarred(!isStarred);
              }}
              className={isStarred ? 'text-accent-warning border-accent-warning' : ''}
            >
              {isStarred ? '★' : '☆'}
            </IconButton>
            <IconButton aria-label="Open in new tab">
              ↗
            </IconButton>
          </div>
        </div>

        {/* Title with Verified Badge */}
        <Link href={`/skills/${skill.id}`}>
          <h3 className="text-[17px] font-semibold text-text-primary hover:text-crimson transition-colors mb-1 flex items-center gap-2">
            {skill.name}
            {skill.verified && (
              <span className="w-4 h-4 bg-crimson rounded-full flex items-center justify-center text-[10px] text-white">
                ✓
              </span>
            )}
          </h3>
        </Link>

        {/* Author */}
        <p className="text-xs text-text-muted mb-3">by {skill.authorId}</p>

        {/* Description */}
        <p className="text-sm text-text-secondary line-clamp-2 mb-3 leading-relaxed">
          {skill.description}
        </p>

        {/* Badges */}
        <div className="flex gap-2 mb-3 flex-wrap">
          <Badge variant={skill.status === 'live' ? 'live' : 'dev'}>
            {skill.status === 'live' ? 'LIVE' : 'IN DEV'}
          </Badge>
          {skill.priority && (
            <Badge variant={skill.priority as 'high' | 'medium' | 'emerging'}>
              {skill.priority.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {skill.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="px-2 py-0.5 text-[10px] rounded bg-bg-tertiary border border-border-default text-text-muted"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border-default flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <span className="text-accent-warning">★</span>
            {skill.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            ↓ {skill.downloads.toLocaleString()}
          </span>
        </div>
        <span className="text-[15px] font-bold text-crimson">
          {skill.price} SOL
        </span>
      </div>
    </Card>
  );
}
