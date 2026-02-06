'use client';

import { Pill, Select } from '@/components/ui';
import type { SkillCategory } from '@/lib/skills';

const categories: { value: SkillCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'research', label: 'Research' },
  { value: 'finance', label: 'Finance' },
  { value: 'coding', label: 'Coding' },
  { value: 'security', label: 'Security' },
  { value: 'creative', label: 'Creative' },
  { value: 'comms', label: 'Comms' },
];

const sortOptions = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'downloads', label: 'Most Downloads' },
];

interface FilterBarProps {
  selectedCategory: SkillCategory | 'all';
  onCategoryChange: (category: SkillCategory | 'all') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function FilterBar({
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Pill
            key={category.value}
            active={selectedCategory === category.value}
            onClick={() => onCategoryChange(category.value)}
          >
            {category.label}
          </Pill>
        ))}
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">Sort by:</span>
        <Select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-40"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
