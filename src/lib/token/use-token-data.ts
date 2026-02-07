'use client';

import { useEffect, useState } from 'react';
import { TOKEN_CONFIG } from './config';

export interface TokenData {
  available: boolean;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  mintAddress: string;
}

const POLL_INTERVAL = 30_000;

export function useTokenData() {
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!TOKEN_CONFIG.mintAddress) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchToken() {
      try {
        const res = await fetch('/api/token');
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        // keep last known data on error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchToken();
    const id = setInterval(fetchToken, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { data, loading };
}
