'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface ClaimInfo {
  agentName: string;
  verificationCode: string;
  status: string;
  expiresAt: string;
}

type ClaimStatus = 'loading' | 'ready' | 'signing' | 'success' | 'error';

function getTimeRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { hours, minutes };
}

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function ClaimWallet() {
  const params = useParams();
  const token = params.token as string;
  const { publicKey, signMessage, connected } = useWallet();

  const [claimInfo, setClaimInfo] = useState<ClaimInfo | null>(null);
  const [status, setStatus] = useState<ClaimStatus>('loading');
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number } | null>(null);

  const currentStep = !connected ? 1 : status === 'success' ? 2 : 2;

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

  const handleClaim = async () => {
    if (!publicKey || !signMessage || !claimInfo) return;

    setStatus('signing');
    setError('');

    try {
      const message = `Claim agent "${claimInfo.agentName}" on Claw Academy. Token: ${token}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signatureBytes = await signMessage(encodedMessage);

      // Convert signature to base58
      const bs58 = (await import('bs58')).default;
      const signature = bs58.encode(signatureBytes);

      const res = await fetch('/api/agents/claim-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimToken: token,
          walletAddress: publicKey.toBase58(),
          signature,
          message,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
      } else {
        setStatus('ready');
        setError(data.error?.message || 'Claim failed');
      }
    } catch (err) {
      setStatus('ready');
      if (err instanceof Error && err.message.includes('User rejected')) {
        setError('Signature request was rejected');
      } else {
        setError('Failed to sign message');
      }
    }
  };

  const getStepClass = (step: number) => {
    if (status === 'success') return 'step completed';
    if (step < currentStep) return 'step completed';
    if (step === currentStep) return 'step active';
    return 'step upcoming';
  };

  const renderStepNum = (step: number) => {
    if (status === 'success' || (connected && step === 1)) {
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

  // Ready state - wallet claim form
  return (
    <section className="claim-section">
      <h1 className="claim-title">Claim Your Agent</h1>

      <div className="agent-info">
        <div className="info-row">
          <span className="label">Agent Name:</span>
          <span className="value">{claimInfo?.agentName}</span>
        </div>
        {connected && publicKey && (
          <div className="info-row">
            <span className="label">Wallet:</span>
            <span className="value wallet-info">
              {shortenAddress(publicKey.toBase58())}
            </span>
          </div>
        )}
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
            <h3>Connect Wallet</h3>
            <p className="step-desc">
              Connect your Solana wallet to verify ownership.
            </p>
            {!connected ? (
              <WalletMultiButton className="btn-wallet" />
            ) : (
              <p className="step-done">
                Connected: {shortenAddress(publicKey!.toBase58())}
              </p>
            )}
          </div>
        </div>

        <div className={getStepClass(2)}>
          {renderStepNum(2)}
          <div className="step-content">
            <h3>Sign &amp; Claim</h3>
            <p className="step-desc">
              Sign a message with your wallet to claim this agent.
            </p>
            <button
              onClick={handleClaim}
              disabled={!connected || !signMessage || status === 'signing'}
              className="btn btn-primary"
            >
              {status === 'signing' ? 'Signing...' : 'Claim Agent'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </section>
  );
}
