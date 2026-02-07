'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface AgentDetail {
  id: string;
  name: string;
  description: string | null;
  status: string;
  walletPublicKey: string;
  owner: {
    id: string;
    twitterHandle: string | null;
    displayName: string | null;
  } | null;
  createdAt: string;
  claimedAt: string | null;
  lastActiveAt: string | null;
  purchaseCount: number;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shortenWallet(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function isOnline(lastActiveAt: string | null): boolean {
  if (!lastActiveAt) return false;
  return Date.now() - new Date(lastActiveAt).getTime() < 5 * 60 * 1000;
}

export default function AgentDetailPage() {
  return <Suspense><AgentDetailContent /></Suspense>;
}

function AgentDetailContent() {
  const params = useParams();
  const agentId = params.id as string;
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/agents/${agentId}`)
      .then(res => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && !data.error) {
          setAgent(data);
        }
      })
      .catch(err => console.error('Failed to load agent:', err))
      .finally(() => setLoading(false));
  }, [agentId]);

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        Loading agent...
      </div>
    );
  }

  if (notFound || !agent) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>Agent not found</h3>
        <p style={{ marginBottom: 16 }}>The agent you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/agents" style={{ color: 'var(--crimson)' }}>
          Back to Agents
        </Link>
      </div>
    );
  }

  return (
    <div className="agent-detail-section">
      {/* Header */}
      <div className="agent-detail-header">
        <div className="agent-detail-header-left">
          <div className="skill-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', width: 48, height: 48, fontSize: 24, position: 'relative' }}>
            🤖
            <span className={isOnline(agent.lastActiveAt) ? 'online-dot' : 'offline-dot'} />
          </div>
          <div>
            <div className="agent-detail-title-row">
              <h1 className="agent-detail-name">{agent.name}</h1>
              <span className={`status-badge ${agent.status}`}>{agent.status.replace('_', ' ')}</span>
            </div>
            <span className="agent-detail-wallet">{shortenWallet(agent.walletPublicKey)}</span>
          </div>
        </div>
        <Link href="/agents" className="agent-detail-back">← All Agents</Link>
      </div>

      {/* Content Grid */}
      <div className="agent-detail-grid">
        {/* Left: Main Content */}
        <div className="agent-detail-main">
          {/* Description */}
          <div className="agent-detail-card">
            <h2 className="agent-detail-card-title">Description</h2>
            <p className="agent-detail-card-text">
              {agent.description || 'No description provided.'}
            </p>
          </div>

          {/* Agent Details */}
          <div className="agent-detail-card">
            <h2 className="agent-detail-card-title">Agent Details</h2>
            <div className="agent-detail-info">
              <div className="info-row">
                <span className="label">Status</span>
                <span className={`status-badge ${agent.status}`}>{agent.status.replace('_', ' ')}</span>
              </div>
              <div className="info-row">
                <span className="label">Wallet</span>
                <span className="value code">{agent.walletPublicKey}</span>
              </div>
              <div className="info-row">
                <span className="label">Registered</span>
                <span className="value">{formatDate(agent.createdAt)}</span>
              </div>
              <div className="info-row">
                <span className="label">Claimed</span>
                <span className="value">{formatDate(agent.claimedAt)}</span>
              </div>
              <div className="info-row">
                <span className="label">Last Active</span>
                <span className="value">{formatDate(agent.lastActiveAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="agent-detail-sidebar">
          {/* Owner */}
          <div className="agent-detail-card">
            <h2 className="agent-detail-card-title">Owner</h2>
            {agent.owner ? (
              <div className="agent-detail-owner">
                <div className="agent-detail-owner-avatar">
                  {agent.owner.displayName?.[0]?.toUpperCase() || '👤'}
                </div>
                <div>
                  <div className="agent-detail-owner-name">
                    {agent.owner.displayName || 'Anonymous'}
                  </div>
                  {agent.owner.twitterHandle && (
                    <a
                      href={`https://x.com/${agent.owner.twitterHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="agent-detail-owner-twitter"
                    >
                      @{agent.owner.twitterHandle}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="agent-detail-unclaimed">
                <span style={{ fontSize: 24 }}>🔓</span>
                <span>Unclaimed</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="agent-detail-card">
            <h2 className="agent-detail-card-title">Stats</h2>
            <div className="agent-detail-stat-row">
              <span className="label">Purchased Skills</span>
              <span className="agent-detail-stat-value">{agent.purchaseCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
