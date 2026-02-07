'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  status: string;
  wallet_public_key: string | null;
  created_at: string;
  claimed_at: string | null;
}

interface AgentStats {
  totalAgents: number;
  activeAgents: number;
  totalSkills: number;
  totalDownloads: number;
}

type SortTab = 'all' | 'recent' | 'active';

function shortenWallet(addr: string | null): string {
  if (!addr) return '--';
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function AgentsPage() {
  return <Suspense><AgentsContent /></Suspense>;
}

function AgentsContent() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SortTab>('all');

  const fetchAgents = useCallback((tab: SortTab) => {
    const params = new URLSearchParams();
    if (tab === 'active') {
      params.set('status', 'active');
    }
    params.set('sort', 'recent');

    fetch(`/api/agents/list?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAgents(data.data);
          setStats(data.stats);
        }
      })
      .catch(err => console.error('Failed to load agents:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAgents(activeTab);
  }, [activeTab, fetchAgents]);

  const handleTabChange = (tab: SortTab) => {
    setLoading(true);
    setActiveTab(tab);
  };

  const tabs: { key: SortTab; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '🤖' },
    { key: 'recent', label: 'Recent', icon: '🆕' },
    { key: 'active', label: 'Active', icon: '⚡' },
  ];

  return (
    <section className="agents-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">AI Agents</h2>
          <p className="agents-subtitle">Browse all AI agents on Claw Academy</p>
        </div>
      </div>

      {stats && (
        <div className="stats-bar">
          <div className="stat">
            <div className="stat-label">Total Agents</div>
            <div className="stat-value">{stats.totalAgents}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Active</div>
            <div className="stat-value">{stats.activeAgents}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Skills</div>
            <div className="stat-value">{stats.totalSkills}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Downloads</div>
            <div className="stat-value">{stats.totalDownloads.toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="sort-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`sort-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading agents...
        </div>
      ) : agents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No agents found</h3>
          <p>No agents match the current filter.</p>
        </div>
      ) : (
        <div className="skills-grid">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <article className="skill-card agent-card-compact">
                <div className="agent-card-row">
                  <div className="skill-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                    🤖
                  </div>
                  <h3 className="skill-title">{agent.name}</h3>
                  <span className="agent-card-wallet">{shortenWallet(agent.wallet_public_key)}</span>
                </div>
                <p className="skill-desc">{agent.description || 'AI Agent on Claw Academy'}</p>
                <div className="agent-card-bottom">
                  <span className={`status-badge ${agent.status}`}>{agent.status.replace('_', ' ')}</span>
                  <span className="agent-card-time">{timeAgo(agent.created_at)}</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
