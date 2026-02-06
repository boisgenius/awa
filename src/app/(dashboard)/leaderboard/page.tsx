'use client';

import { useState } from 'react';

// Leaderboard data from prototype
const leaderboardData = [
  { rank: 1, name: "Research Master Pro", emoji: "🔬", gradient: "linear-gradient(135deg, #E40F3A, #770524)", category: "Research", change24h: "+12.4%", change24hPos: true, change7d: "+127.4%", change7dPos: true, downloads: "2,847", verified: true },
  { rank: 2, name: "Trading Strategist", emoji: "📈", gradient: "linear-gradient(135deg, #00FF88, #00CC6A)", category: "Finance", change24h: "+8.7%", change24hPos: true, change7d: "+234.7%", change7dPos: true, downloads: "1,923", verified: true },
  { rank: 3, name: "Security Guardian", emoji: "🛡️", gradient: "linear-gradient(135deg, #FF6B00, #FF8533)", category: "Security", change24h: "+15.2%", change24hPos: true, change7d: "+89.1%", change7dPos: true, downloads: "3,421", verified: true },
  { rank: 4, name: "Code Assistant v3", emoji: "💻", gradient: "linear-gradient(135deg, #7C3AED, #A855F7)", category: "Coding", change24h: "-2.3%", change24hPos: false, change7d: "+42.8%", change7dPos: true, downloads: "1,567", verified: true },
  { rank: 5, name: "Content Creator Kit", emoji: "🎨", gradient: "linear-gradient(135deg, #FFD93D, #FFC107)", category: "Creative", change24h: "-5.4%", change24hPos: false, change7d: "-8.2%", change7dPos: false, downloads: "987", verified: true }
];

const timeRanges = ['24H', '7D', '30D', 'All'];

export default function LeaderboardPage() {
  const [activeTime, setActiveTime] = useState('24H');

  return (
    <section className="leaderboard-section">
      <div className="section-header">
        <h2 className="section-title">Top Performers</h2>
        <div className="time-pills">
          {timeRanges.map(range => (
            <button
              key={range}
              className={`time-pill ${activeTime === range ? 'active' : ''}`}
              onClick={() => setActiveTime(range)}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th className="sortable">SKILL ↕</th>
              <th>CATEGORY</th>
              <th className="sortable">24H ↕</th>
              <th className="sortable">7D ↕</th>
              <th className="sortable">DOWNLOADS ↕</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map(item => (
              <tr key={item.rank}>
                <td className="td-rank">{item.rank}</td>
                <td>
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
                </td>
                <td className="td-category">{item.category}</td>
                <td className={`td-change ${item.change24hPos ? 'positive' : 'negative'}`}>
                  {item.change24h}
                </td>
                <td className={`td-change ${item.change7dPos ? 'positive' : 'negative'}`}>
                  {item.change7d}
                </td>
                <td><span className="mono">{item.downloads}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
