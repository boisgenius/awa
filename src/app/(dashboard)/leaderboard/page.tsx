'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { mockSkills, getLeaderboardData } from '@/lib/skills/mock-data';

const timeRanges = ['24H', '7D', '30D', 'All'];

type SortColumn = 'name' | 'change' | 'downloads';
type SortDir = 'asc' | 'desc';

export default function LeaderboardPage() {
  return <Suspense><LeaderboardContent /></Suspense>;
}

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [activeTime, setActiveTime] = useState('24H');
  const [sortCol, setSortCol] = useState<SortColumn>('change');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleTimeChange = (range: string) => {
    setActiveTime(range);
    // Reset to default sort when switching time range
    setSortCol('change');
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

  const getChangeValue = (item: { change24h: number; change7d: number; change30d: number }) => {
    switch (activeTime) {
      case '7D': return item.change7d;
      case '30D': return item.change30d;
      default: return item.change24h;
    }
  };

  const leaderboardData = useMemo(() => {
    const changeKey = activeTime === '7D' ? 'change7d' : activeTime === '30D' ? 'change30d' : 'change24h';
    let data = getLeaderboardData(mockSkills, activeTime);

    // Apply search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    // Apply column sorting
    data.sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'change':
          cmp = a[changeKey] - b[changeKey];
          break;
        case 'downloads':
          cmp = a.downloads - b.downloads;
          break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

    // Re-assign ranks after sorting
    return data.map((item, i) => ({ ...item, rank: i + 1 }));
  }, [activeTime, searchQuery, sortCol, sortDir]);

  const sortIndicator = (col: SortColumn) => {
    if (sortCol !== col) return ' ⇅';
    return sortDir === 'desc' ? ' ↓' : ' ↑';
  };

  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Column header for the change column
  const changeLabel = activeTime === 'All' ? 'CHANGE' : activeTime;

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
              {range}
            </button>
          ))}
        </div>
      </div>

      {searchQuery && (
        <div style={{ padding: '0 0 16px', color: 'var(--text-secondary)', fontSize: 14 }}>
          Showing results for &quot;{searchQuery}&quot;
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
            {leaderboardData.map((item) => {
              const changeVal = getChangeValue(item);
              return (
                <tr key={item.id}>
                  <td className="td-rank">{item.rank}</td>
                  <td>
                    <Link href={`/skills/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div className="skill-cell">
                        <div className="mini-icon" style={{ background: item.gradient }}>
                          {item.emoji}
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
                  <td className={`td-change ${changeVal >= 0 ? 'positive' : 'negative'}`}>
                    {formatChange(changeVal)}
                  </td>
                  <td><span className="mono">{item.downloads.toLocaleString()}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {leaderboardData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No results found</h3>
          <p>Try adjusting your search.</p>
        </div>
      )}
    </section>
  );
}
