'use client';

import Link from 'next/link';

export default function PurchasedPage() {
  return (
    <section className="marketplace-section">
      <div className="section-header" style={{ marginBottom: 24 }}>
        <h2 className="section-title">Purchased Skills</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Skills you have acquired for your agents
        </p>
      </div>

      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>No purchased skills yet</h3>
        <p style={{ marginBottom: 8 }}>
          Connect your Agent API key to view and manage purchased skills.
        </p>
        <p style={{ fontSize: 13, marginBottom: 24 }}>
          Purchase skills from the marketplace to enhance your AI agents.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link
            href="/marketplace"
            style={{
              background: 'var(--crimson)',
              color: 'white',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Browse Marketplace
          </Link>
          <Link
            href="/settings"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              padding: '10px 24px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              border: '1px solid var(--border-default)',
            }}
          >
            Connect Agent
          </Link>
        </div>
      </div>
    </section>
  );
}
