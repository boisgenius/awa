'use client';

import { useState } from 'react';
import { Card, Pill, Badge } from '@/components/ui';

// Mock leaderboard data
const mockLeaderboard = [
  {
    rank: 1,
    name: 'Web Research Pro',
    author: 'ResearchLabs',
    category: 'research',
    downloads: 2340,
    volume: 1170,
    rating: 4.8,
    change: 12,
  },
  {
    rank: 2,
    name: 'Creative Writer',
    author: 'AIWriters',
    category: 'creative',
    downloads: 1890,
    volume: 756,
    rating: 4.7,
    change: 8,
  },
  {
    rank: 3,
    name: 'Code Review Assistant',
    author: 'DevTools',
    category: 'coding',
    downloads: 1560,
    volume: 1248,
    rating: 4.9,
    change: -2,
  },
  {
    rank: 4,
    name: 'Communication Hub',
    author: 'CommsAI',
    category: 'comms',
    downloads: 1200,
    volume: 840,
    rating: 4.5,
    change: 5,
  },
  {
    rank: 5,
    name: 'Financial Analyst',
    author: 'FinanceAI',
    category: 'finance',
    downloads: 890,
    volume: 1068,
    rating: 4.6,
    change: 0,
  },
];

const timeRanges = ['24H', '7D', '30D', 'All'];

export default function LeaderboardPage() {
  const [timeRange, setTimeRange] = useState('7D');

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Leaderboard
        </h1>
        <p className="text-text-secondary">
          Top performing skills by downloads and transaction volume
        </p>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2 mb-6">
        {timeRanges.map((range) => (
          <Pill
            key={range}
            active={timeRange === range}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </Pill>
        ))}
      </div>

      {/* Leaderboard Table */}
      <Card hover={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-bg-tertiary">
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                  Rank
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                  Skill
                </th>
                <th className="text-left text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                  Category
                </th>
                <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                  Downloads
                </th>
                <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                  Volume (SOL)
                </th>
                <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                  Rating
                </th>
                <th className="text-right text-xs font-medium text-text-muted uppercase tracking-wider px-4 py-3">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {mockLeaderboard.map((item) => (
                <tr
                  key={item.rank}
                  className="hover:bg-bg-hover transition-colors"
                >
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        item.rank === 1
                          ? 'bg-accent-warning/20 text-accent-warning'
                          : item.rank === 2
                          ? 'bg-text-muted/20 text-text-secondary'
                          : item.rank === 3
                          ? 'bg-crimson/20 text-crimson'
                          : 'bg-bg-tertiary text-text-muted'
                      }`}
                    >
                      {item.rank}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="font-medium text-text-primary">
                        {item.name}
                      </div>
                      <div className="text-sm text-text-muted">
                        by {item.author}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="default">{item.category}</Badge>
                  </td>
                  <td className="px-4 py-4 text-right text-text-primary">
                    {item.downloads.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right text-text-primary">
                    {item.volume.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <svg
                        className="h-4 w-4 text-accent-warning"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-text-primary">{item.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {item.change > 0 ? (
                      <span className="text-accent-secondary">
                        +{item.change}%
                      </span>
                    ) : item.change < 0 ? (
                      <span className="text-accent-danger">{item.change}%</span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
