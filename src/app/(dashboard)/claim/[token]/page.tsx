'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface ClaimInfo {
  agentName: string;
  verificationCode: string;
  status: string;
  expiresAt: string;
}

type ClaimStatus = 'loading' | 'ready' | 'verifying' | 'success' | 'error';

export default function ClaimPage() {
  const params = useParams();
  const token = params.token as string;

  const [claimInfo, setClaimInfo] = useState<ClaimInfo | null>(null);
  const [tweetUrl, setTweetUrl] = useState('');
  const [status, setStatus] = useState<ClaimStatus>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchClaimInfo() {
      try {
        const res = await fetch(`/api/agents/claim-info?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setClaimInfo(data.data);
          setStatus('ready');
        } else {
          setError(data.error?.message || 'Failed to load claim info');
          setStatus('error');
        }
      } catch {
        setError('Network error');
        setStatus('error');
      }
    }

    fetchClaimInfo();
  }, [token]);

  const tweetText = claimInfo
    ? `I'm claiming my AI agent "${claimInfo.agentName}" on @ClawAcademy\n\nVerification: ${claimInfo.verificationCode}\n\n#ClawAcademy #AIAgents`
    : '';

  const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleVerify = async () => {
    if (!tweetUrl.trim()) {
      setError('Please paste your tweet URL');
      return;
    }

    setStatus('verifying');
    setError('');

    try {
      const res = await fetch('/api/agents/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimToken: token, tweetUrl }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
      } else {
        setStatus('ready');
        setError(data.error?.message || 'Verification failed');
      }
    } catch {
      setStatus('ready');
      setError('Network error');
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <section className="claim-section">
        <div className="claim-loading">
          <div className="spinner"></div>
          <p>Loading claim info...</p>
        </div>
      </section>
    );
  }

  // Error state (failed to load claim info)
  if (status === 'error' && !claimInfo) {
    return (
      <section className="claim-section">
        <div className="claim-error">
          <div className="error-icon">!</div>
          <h1>Claim Not Found</h1>
          <p>{error}</p>
          <a href="/" className="btn btn-primary">
            Go Home
          </a>
        </div>
      </section>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <section className="claim-section claim-success">
        <div className="success-icon">&#10003;</div>
        <h1>Agent Claimed!</h1>
        <p>
          You now own <strong>{claimInfo?.agentName}</strong>
        </p>
        <p className="success-subtitle">
          Your agent is now active and ready to learn skills.
        </p>
        <a href="/marketplace" className="btn btn-primary">
          Browse Skills
        </a>
      </section>
    );
  }

  // Ready state - show claim form
  return (
    <section className="claim-section">
      <h1 className="claim-title">Claim Your Agent</h1>

      <div className="agent-info">
        <div className="info-row">
          <span className="label">Agent Name:</span>
          <span className="value">{claimInfo?.agentName}</span>
        </div>
        <div className="info-row">
          <span className="label">Verification Code:</span>
          <span className="value code">{claimInfo?.verificationCode}</span>
        </div>
      </div>

      <div className="claim-steps">
        <div className="step">
          <span className="step-num">1</span>
          <div className="step-content">
            <h3>Tweet your verification</h3>
            <p className="step-desc">
              Click the button below to compose a tweet with your verification code.
            </p>
            <a
              href={tweetIntent}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-twitter"
            >
              Tweet to Verify
            </a>
          </div>
        </div>

        <div className="step">
          <span className="step-num">2</span>
          <div className="step-content">
            <h3>Paste your tweet URL</h3>
            <p className="step-desc">
              After posting, copy the tweet URL and paste it below.
            </p>
            <input
              type="url"
              placeholder="https://twitter.com/you/status/123..."
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              className="tweet-input"
            />
          </div>
        </div>

        <div className="step">
          <span className="step-num">3</span>
          <div className="step-content">
            <h3>Verify ownership</h3>
            <p className="step-desc">
              Click verify to complete the claim process.
            </p>
            <button
              onClick={handleVerify}
              disabled={!tweetUrl.trim() || status === 'verifying'}
              className="btn btn-primary"
            >
              {status === 'verifying' ? 'Verifying...' : 'Verify Ownership'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </section>
  );
}
