import { NextResponse } from 'next/server';
import { TOKEN_CONFIG } from '@/lib/token/config';

export async function GET() {
  const { mintAddress } = TOKEN_CONFIG;

  if (!mintAddress) {
    return NextResponse.json({ available: false });
  }

  try {
    const res = await fetch(
      `https://frontend-api-v3.pump.fun/coins/${mintAddress}`,
      { next: { revalidate: 30 } }
    );

    if (!res.ok) {
      return NextResponse.json({ available: false, error: 'upstream_error' });
    }

    const coin = await res.json();

    return NextResponse.json(
      {
        available: true,
        mintAddress,
        price: coin.usd_market_cap && coin.total_supply
          ? coin.usd_market_cap / (coin.total_supply / 1e6)
          : 0,
        marketCap: coin.usd_market_cap ?? 0,
        volume24h: coin.volume_24h ?? 0,
        priceChange24h: coin.price_change_24h ?? 0,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch {
    return NextResponse.json({ available: false, error: 'fetch_failed' });
  }
}
