'use client';

import { Suspense, useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { categoryGradients } from '@/lib/skills/category-meta';

const timeRanges = ['24h', '7d', '30d', 'all'];

type SortColumn = 'name' | 'change' | 'downloads';
type SortDir = 'asc' | 'desc';

export default function LeaderboardPage() {
  return <Suspense><LeaderboardContent /></Suspense>;
}

interface LeaderboardItem {
  rank: number;
  skillId: string;
  name: string;
  author: string;
  category: string;
  downloads: number;
  volume: number;
  rating: number;
  change: number;
  iconEmoji?: string;
  verified: boolean;
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [activeTime, setActiveTime] = useState('24h');
  const [sortCol, setSortCol] = useState<SortColumn>('downloads');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [items, setItems] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleTimeChange = (range: string) => {
    setActiveTime(range);
    setSortCol('downloads');
    setSortDir('desc');
  };

  const handleSort = (col: SortColumn) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('timeRange', activeTime);
        params.set('sortBy', 'trending');
        params.set('limit', '20');

        const res = await fetch(`/api/leaderboard?${params}`);
        const data = await res.json();
        setItems(data.data || []);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [activeTime]);

  const leaderboardData = useMemo(() => {
    let data = [...items];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'change':
          cmp = a.change - b.change;
          break;
        case 'downloads':
          cmp = a.downloads - b.downloads;
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return data.map((item, i) => ({ ...item, rank: i + 1 }));
  }, [items, searchQuery, sortCol, sortDir]);

  const sortIndicator = (col: SortColumn) => {
    if (sortCol !== col) return ' ⇅';
    return sortDir === 'desc' ? ' ↓' : ' ↑';
  };

  const changeLabel = activeTime === 'all' ? 'CHANGE' : activeTime.toUpperCase();

  return (
    <section className="leaderboard-section">
      <div className="section-header">
        <h2 className="section-title">Top Performers</h2>
        <div className="time-pills">
          {timeRanges.map((range) => (
            <button
              key={range}
              className={`time-pill ${activeTime === range ? 'active' : ''}`}
              onClick={() => handleTimeChange(range)}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {searchQuery && (
        <div style={{ padding: '0 0 16px', color: 'var(--text-secondary)', fontSize: 14 }}>
          Showing results for &quot;{searchQuery}&quot;
        </div>
      )}

      {loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 24 }}>Loading...</div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th className="sortable" onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                SKILL{sortIndicator('name')}
              </th>
              <th>CATEGORY</th>
              <th className="sortable" onClick={() => handleSort('change')} style={{ cursor: 'pointer' }}>
                {changeLabel}{sortIndicator('change')}
              </th>
              <th className="sortable" onClick={() => handleSort('downloads')} style={{ cursor: 'pointer' }}>
                DOWNLOADS{sortIndicator('downloads')}
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((item) => (
              <tr key={item.skillId}>
                <td className="td-rank">{item.rank}</td>
                <td>
                  <Link href={`/skills/${item.skillId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="skill-cell">
                      <div className="mini-icon" style={{ background: categoryGradients[item.category] || categoryGradients.coding }}>
                        {item.iconEmoji || '📦'}
                      </div>
                      <span className="skill-cell-name">
                        {item.name}
                        {item.verified && (
                          <span className="verified-badge" style={{ width: 14, height: 14, fontSize: 8 }}>✓</span>
                        )}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="td-category">{item.category}</td>
                <td className={`td-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change}%
                </td>
                <td><span className="mono">{item.downloads.toLocaleString()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && leaderboardData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No results found</h3>
          <p>Try adjusting your search.</p>
        </div>
      )}
    </section>
  );
}
