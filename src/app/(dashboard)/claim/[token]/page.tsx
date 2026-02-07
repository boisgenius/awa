'use client';

import dynamic from 'next/dynamic';

const claimMode = process.env.NEXT_PUBLIC_CLAIM_MODE || 'twitter';

const ClaimTwitter = dynamic(() => import('./claim-twitter'));
const ClaimWallet = dynamic(() => import('./claim-wallet'));
const WalletProviderWrapper = dynamic(
  () => import('@/components/providers/WalletProvider'),
  { ssr: false }
);

export default function ClaimPage() {
  if (claimMode === 'wallet') {
    return (
      <WalletProviderWrapper>
        <ClaimWallet />
      </WalletProviderWrapper>
    );
  }

  return <ClaimTwitter />;
}
