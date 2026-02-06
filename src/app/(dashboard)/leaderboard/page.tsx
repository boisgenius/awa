'use client';

import { useState } from 'react';
import { Card, Pill } from '@/components/ui';

// Category icon and gradient mapping
const categoryStyles: Record<string, { icon: string; gradient: string }> = {
  research: { icon: '🔬', gradient: 'linear-gradient(135deg, #E40F3A, #770524)' },
  finance: { icon: '📈', gradient: 'linear-gradient(135deg, #00FF88, #00CC6A)' },
  coding: { icon: '💻', gradient: 'linear-gradient(135deg, #7C3AED, #A855F7)' },
  security: { icon: '🛡️', gradient: 'linear-gradient(135deg, #FF6B00, #FF8533)' },
  creative: { icon: '🎨', gradient: 'linear-gradient(135deg, #FFD93D, #FFC107)' },
  comms: { icon: '✉️', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)' },
};

// Mock leaderboard data
const mockLeaderboard = [
  {
    rank: 1,
    name: 'Research Master Pro',
    category: 'research',
    floor: '2.34',
    change24h: '+12.4%',
    change24hPos: true,
    change7d: '+127.4%',
    change7dPos: true,
    volume: '1,234.56',
    downloads: '2,847',
    verified: true,
  },
  {
    rank: 2,
    name: 'Trading Strategist',
    category: 'finance',
    floor: '4.87',
    change24h: '+8.7%',
    change24hPos: true,
    change7d: '+234.7%',
    change7dPos: true,
    volume: '987.32',
    downloads: '1,923',
    verified: true,
  },
  {
    rank: 3,
    name: 'Security Guardian',
    category: 'security',
    floor: '3.98',
    change24h: '+15.2%',
    change24hPos: true,
    change7d: '+89.1%',
    change7dPos: true,
    volume: '678.45',
    downloads: '3,421',
    verified: true,
  },
  {
    rank: 4,
    name: 'Code Assistant v3',
    category: 'coding',
    floor: '2.76',
    change24h: '-2.3%',
    change24hPos: false,
    change7d: '+42.8%',
    change7dPos: true,
    volume: '456.78',
    downloads: '1,567',
    verified: true,
  },
  {
    rank: 5,
    name: 'Content Creator Kit',
    category: 'creative',
    floor: '1.54',
    change24h: '-5.4%',
    change24hPos: false,
    change7d: '-8.2%',
    change7dPos: false,
    volume: '234.12',
    downloads: '987',
    verified: true,
  },
];

const timeRanges = ['24H', '7D', '30D', 'All'];

export default function LeaderboardPage() {
  const [timeRange, setTimeRange] = useState('24H');

  return (
    <div>
      {/* Section Header */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <h2 className="text-xl font-semibold">Top Performers</h2>
        <div className="flex gap-2">
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
      </div>

      {/* Leaderboard Table */}
      <Card hover={false} className="overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border-default bg-bg-secondary">
                <th className="text-left text-[11px] font-medium text-text-muted uppercase tracking-wide px-4 py-4">
                  #
                </th>
                <th className="text-left text-[11px] font-medium text-text-muted uppercase tracking-wide px-4 py-4 cursor-pointer hover:text-text-primary">
                  SKILL ↕
                </th>
                <th className="text-left text-[11px] font-medium text-text-muted uppercase tracking-wide px-4 py-4">
                  CATEGORY
                </th>
                <th className="text-left text-[11px] font-medium text-text-muted uppercase tracking-wide px-4 py-4 cursor-pointer hover:text-text-primary">
                  FLOOR ↕
                </th>
                <th className="text-left text-[11px] font-medium text-text-muted uppercase tracking-wide px-4 py-4 cursor-pointer hover:text-text-primary">
                  24H ↕
                </th>
                <th className="text-left text-[11px] font-medium text-text-muted uppercase tracking-wide px-4 py-4 cursor-pointer hover:text-text-primary">
                  7D ↕
                </th>
                <th className="text-left text-[11px] font-medium text-text-muted uppercase tracking-wide px-4 py-4 cursor-pointer hover:text-text-primary">
                  VOLUME ↕
                </th>
                <th className="text-left text-[11px] font-medium text-text-muted uppercase tracking-wide px-4 py-4 cursor-pointer hover:text-text-primary">
                  DOWNLOADS ↕
                </th>
              </tr>
            </thead>
            <tbody>
              {mockLeaderboard.map((item) => {
                const style = categoryStyles[item.category] || categoryStyles.research;
                return (
                  <tr
                    key={item.rank}
                    className="border-b border-border-default last:border-b-0 hover:bg-bg-hover transition-colors"
                  >
                    <td className="px-4 py-4 text-text-muted text-center w-[50px]">
                      {item.rank}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                          style={{ background: style.gradient }}
                        >
                          {style.icon}
                        </div>
                        <span className="flex items-center gap-2 text-sm">
                          {item.name}
                          {item.verified && (
                            <span className="w-3.5 h-3.5 bg-crimson rounded-full flex items-center justify-center text-[8px] text-white">
                              ✓
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-text-secondary text-sm">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="font-mono">{item.floor}</span> SOL
                    </td>
                    <td className={`px-4 py-4 text-sm font-medium ${item.change24hPos ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                      {item.change24h}
                    </td>
                    <td className={`px-4 py-4 text-sm font-medium ${item.change7dPos ? 'text-accent-secondary' : 'text-accent-danger'}`}>
                      {item.change7d}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="font-mono">{item.volume}</span> SOL
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="font-mono">{item.downloads}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
