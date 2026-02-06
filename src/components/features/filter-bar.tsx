'use client';

import { Pill, Select } from '@/components/ui';
import type { SkillCategory } from '@/lib/skills';

const categories: { value: SkillCategory | 'all'; label: string; icon?: string; count: number }[] = [
  { value: 'all', label: 'All', count: 142 },
  { value: 'research', label: 'Research', icon: '🔬', count: 18 },
  { value: 'finance', label: 'Finance', icon: '📈', count: 24 },
  { value: 'coding', label: 'Coding', icon: '💻', count: 35 },
  { value: 'security', label: 'Security', icon: '🛡️', count: 12 },
  { value: 'creative', label: 'Creative', icon: '🎨', count: 28 },
  { value: 'comms', label: 'Comms', icon: '✉️', count: 25 },
];

const sortOptions = [
  { value: 'trending', label: 'Sort: Trending' },
  { value: 'newest', label: 'Sort: Newest' },
  { value: 'price-low', label: 'Sort: Price Low' },
  { value: 'price-high', label: 'Sort: Price High' },
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
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Pill
            key={category.value}
            active={selectedCategory === category.value}
            onClick={() => onCategoryChange(category.value)}
            count={category.count}
          >
            {category.icon && <span className="mr-1">{category.icon}</span>}
            {category.label}
          </Pill>
        ))}
      </div>

      {/* Sort Select */}
      <Select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-bg-secondary border-border-default text-text-secondary text-[13px]"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
