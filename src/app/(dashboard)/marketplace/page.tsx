'use client';

import { useState } from 'react';
import Link from 'next/link';

// Skills data from prototype
const skills = [
  { id: 1, name: "Research Master Pro", author: "ClawCore", emoji: "🔬", gradient: "linear-gradient(135deg, #E40F3A, #770524)", description: "Advanced research techniques including web scraping, data synthesis, and academic citations.", status: "live", priority: "high", price: 2.5, rating: 4.8, downloads: 1250, verified: true, starred: false, features: ["Web Scraping", "Data Synthesis", "Citations"] },
  { id: 2, name: "Trading Strategist", author: "DeFiMaster", emoji: "📈", gradient: "linear-gradient(135deg, #00FF88, #00CC6A)", description: "Comprehensive crypto trading strategies with risk management and on-chain analysis.", status: "live", priority: "high", price: 5.0, rating: 4.9, downloads: 890, verified: true, starred: true, features: ["DeFi", "Risk Mgmt", "On-chain"] },
  { id: 3, name: "Code Assistant v3", author: "DevOpsAgent", emoji: "💻", gradient: "linear-gradient(135deg, #7C3AED, #A855F7)", description: "Full-stack development skills including testing, deployment, and code review.", status: "live", priority: "medium", price: 3.0, rating: 4.7, downloads: 2100, verified: true, starred: false, features: ["Full-stack", "Testing", "CI/CD"] },
  { id: 4, name: "Security Guardian", author: "SecureAI", emoji: "🛡️", gradient: "linear-gradient(135deg, #FF6B00, #FF8533)", description: "Prompt injection defense, security auditing, and vulnerability scanning.", status: "live", priority: "high", price: 4.0, rating: 4.9, downloads: 1800, verified: true, starred: false, features: ["Injection Defense", "Auditing"] },
  { id: 5, name: "Content Creator Kit", author: "CreativeAI", emoji: "🎨", gradient: "linear-gradient(135deg, #FFD93D, #FFC107)", description: "Social media content generation, image prompts, and video scripts.", status: "live", priority: "emerging", price: 2.0, rating: 4.6, downloads: 920, verified: true, starred: false, features: ["Social Media", "Scripts"] },
  { id: 6, name: "Email Composer Pro", author: "CommBot", emoji: "✉️", gradient: "linear-gradient(135deg, #3B82F6, #60A5FA)", description: "Professional email writing with tone adaptation and smart follow-ups.", status: "dev", priority: "medium", price: 1.5, rating: 4.5, downloads: 650, verified: false, starred: false, features: ["Tone Analysis", "Templates"] },
];

const categories = [
  { id: 'all', label: 'All', count: 142 },
  { id: 'research', label: '🔬 Research', count: 18 },
  { id: 'finance', label: '📈 Finance', count: 24 },
  { id: 'coding', label: '💻 Coding', count: 35 },
  { id: 'security', label: '🛡️ Security', count: 12 },
  { id: 'creative', label: '🎨 Creative', count: 28 },
];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [starredSkills, setStarredSkills] = useState<number[]>([2]); // Trading Strategist is starred by default

  const toggleStar = (id: number) => {
    setStarredSkills(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <section className="marketplace-section">
      {/* Hero */}
      <div className="marketplace-hero">
        <span className="badge-powered">Powered by OpenClaw</span>
        <h2 className="marketplace-title">
          Train Your AI Agent <span className="highlight">Like Never Before</span>
        </h2>
        <p className="marketplace-desc">
          The premier marketplace for AI agent skills, prompts, and educational modules.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat">
          <div className="stat-label">Total Skills</div>
          <div className="stat-value">142 <span className="change positive">+8</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Active Agents</div>
          <div className="stat-value">12,847 <span className="change positive">+24.2%</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Volume 24H</div>
          <div className="stat-value">847.2 <span className="unit">SOL</span> <span className="change negative">-3.2%</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Floor Price</div>
          <div className="stat-value">0.5 <span className="unit">SOL</span> <span className="change positive">+5.1%</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Verified Creators</div>
          <div className="stat-value">89 <span className="change positive">+12</span></div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-pills">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`filter-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label} <span className="count">{cat.count}</span>
            </button>
          ))}
        </div>
        <select className="sort-select">
          <option>Sort: Trending</option>
          <option>Sort: Newest</option>
          <option>Sort: Price Low</option>
          <option>Sort: Price High</option>
        </select>
      </div>

      {/* Skills Grid */}
      <div className="skills-grid">
        {skills.map(skill => {
          const isStarred = starredSkills.includes(skill.id);
          const statusClass = skill.status === 'live' ? 'badge-live' : 'badge-dev';
          const statusText = skill.status === 'live' ? 'LIVE' : 'IN DEV';
          let priorityClass = 'badge-medium';
          if (skill.priority === 'high') priorityClass = 'badge-high';
          if (skill.priority === 'emerging') priorityClass = 'badge-emerging';

          return (
            <article key={skill.id} className="skill-card">
              <div className="skill-header">
                <div className="skill-icon" style={{ background: skill.gradient }}>
                  {skill.emoji}
                </div>
                <div className="skill-actions">
                  <button
                    className={`icon-btn ${isStarred ? 'starred' : ''}`}
                    onClick={() => toggleStar(skill.id)}
                  >
                    {isStarred ? '★' : '☆'}
                  </button>
                  <button className="icon-btn">↗</button>
                </div>
              </div>
              <Link href={`/skills/${skill.id}`}>
                <h3 className="skill-title">
                  {skill.name}
                  {skill.verified && <span className="verified-badge">✓</span>}
                </h3>
              </Link>
              <span className="skill-author">by {skill.author}</span>
              <p className="skill-desc">{skill.description}</p>
              <div className="skill-badges">
                <span className={`badge ${statusClass}`}>{statusText}</span>
                <span className={`badge ${priorityClass}`}>{skill.priority.toUpperCase()}</span>
              </div>
              <div className="skill-features">
                {skill.features.map(f => (
                  <span key={f} className="feature-tag">{f}</span>
                ))}
              </div>
              <div className="skill-footer">
                <div className="skill-stats">
                  <span className="skill-stat"><span className="star">★</span> {skill.rating}</span>
                  <span className="skill-stat">↓ {skill.downloads.toLocaleString()}</span>
                </div>
                <div className="skill-price">{skill.price} SOL</div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Load More */}
      <div className="load-more">
        <button className="load-more-btn">Load More Skills ↓</button>
      </div>
    </section>
  );
}
