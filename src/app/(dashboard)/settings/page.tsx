'use client';

export default function SettingsPage() {
  return (
    <section className="marketplace-section">
      <div className="section-header" style={{ marginBottom: 32 }}>
        <h2 className="section-title">Settings</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
          Manage your account and agent connections
        </p>
      </div>

      {/* Agent Connection */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: 16 }}>
          Agent Connection
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
          Connect your AI agent to access purchased skills and manage deployments.
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 16,
            background: 'var(--bg-primary)',
            borderRadius: 8,
            border: '1px solid var(--border-default)',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#666',
            }}
          />
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Not connected
          </span>
          <button
            style={{
              marginLeft: 'auto',
              background: 'var(--crimson)',
              color: 'white',
              border: 'none',
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Connect Agent
          </button>
        </div>
      </div>

      {/* API Key */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: 16 }}>
          API Key
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
          Your API key for programmatic access to skills and agent management.
        </p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <input
            type="password"
            placeholder="Enter your API key..."
            readOnly
            value=""
            style={{
              flex: 1,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: 8,
              padding: '10px 14px',
              color: 'var(--text-primary)',
              fontSize: 14,
            }}
          />
          <button
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Generate Key
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-default)',
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 8, fontSize: 16 }}>
          Preferences
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
          Customize your experience.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--text-secondary)',
              fontSize: 14,
            }}
          >
            <span>Email notifications for new skills</span>
            <input type="checkbox" disabled />
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'var(--text-secondary)',
              fontSize: 14,
            }}
          >
            <span>Weekly digest</span>
            <input type="checkbox" disabled />
          </label>
        </div>
      </div>
    </section>
  );
}
