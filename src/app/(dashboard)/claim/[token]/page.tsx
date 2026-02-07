'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface ClaimInfo {
  agentName: string;
  verificationCode: string;
  status: string;
  expiresAt: string;
}

type ClaimStatus = 'loading' | 'ready' | 'verifying' | 'success' | 'error';

function getTimeRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
}

export default function ClaimPage() {
  const params = useParams();
  const token = params.token as string;

  const [claimInfo, setClaimInfo] = useState<ClaimInfo | null>(null);
  const [tweetUrl, setTweetUrl] = useState('');
  const [status, setStatus] = useState<ClaimStatus>('loading');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number } | null>(null);

  useEffect(() => {
    async function fetchClaimInfo() {
      try {
        const res = await fetch(`/api/agents/claim-info?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setClaimInfo(data.data);
          setStatus('ready');
          setTimeLeft(getTimeRemaining(data.data.expiresAt));
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

  // Countdown timer
  useEffect(() => {
    if (!claimInfo?.expiresAt) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeRemaining(claimInfo.expiresAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [claimInfo?.expiresAt]);

  const handleTweetUrlChange = (value: string) => {
    setTweetUrl(value);
    if (value.trim() && currentStep < 3) {
      setCurrentStep(3);
    }
  };

  const handleCopy = useCallback(async () => {
    if (!claimInfo) return;
    try {
      await navigator.clipboard.writeText(claimInfo.verificationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the text
    }
  }, [claimInfo]);

  const handleTweetClick = () => {
    setCurrentStep((prev) => Math.max(prev, 2));
  };

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

  const getStepClass = (step: number) => {
    if (status === 'success') return 'step completed';
    if (step < currentStep) return 'step completed';
    if (step === currentStep) return 'step active';
    return 'step upcoming';
  };

  const renderStepNum = (step: number) => {
    if (status === 'success' || step < currentStep) {
      return <span className="step-num">{'\u2713'}</span>;
    }
    return <span className="step-num">{step}</span>;
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
        <div className="confetti" aria-hidden="true">
          <span>🎉</span><span>✨</span><span>🎊</span>
          <span>⭐</span><span>🎉</span><span>✨</span>
        </div>
        <div className="success-icon">&#10003;</div>
        <h1>Agent Claimed!</h1>
        <p>
          You now own <strong>{claimInfo?.agentName}</strong>
        </p>
        <p className="success-subtitle">
          Your agent is now active. It can start browsing and learning skills on Claw Academy.
        </p>
        <div className="success-actions">
          <a href="/marketplace" className="btn btn-primary">
            Browse Skills
          </a>
          <a href="/purchased" className="btn btn-secondary">
            View My Agents
          </a>
        </div>
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
          <span className="value code">
            {claimInfo?.verificationCode}
            <button
              className="copy-btn"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? 'Copied!' : '\uD83D\uDCCB'}
            </button>
          </span>
        </div>
        {claimInfo?.expiresAt && (
          <div className="info-row">
            <span className="label">Expires:</span>
            <span className={`value expiry-countdown${!timeLeft ? ' expired' : ''}`}>
              {timeLeft
                ? `${timeLeft.hours}h ${timeLeft.minutes}m remaining`
                : 'Expired'}
            </span>
          </div>
        )}
      </div>

      <div className="claim-steps">
        <div className={getStepClass(1)}>
          {renderStepNum(1)}
          <div className="step-connector"></div>
          <div className="step-content">
            <h3>Post on X to verify</h3>
            <p className="step-desc">
              Click the button below to compose a post with your verification code.
            </p>
            <a
              href={tweetIntent}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-twitter"
              onClick={handleTweetClick}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post on X to Verify
            </a>
          </div>
        </div>

        <div className={getStepClass(2)}>
          {renderStepNum(2)}
          <div className="step-connector"></div>
          <div className="step-content">
            <h3>Paste your post URL</h3>
            <p className="step-desc">
              After posting, copy the post URL and paste it below.
            </p>
            <input
              type="url"
              placeholder="https://x.com/you/status/123..."
              value={tweetUrl}
              onChange={(e) => handleTweetUrlChange(e.target.value)}
              className="tweet-input"
            />
          </div>
        </div>

        <div className={getStepClass(3)}>
          {renderStepNum(3)}
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
