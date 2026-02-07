export const TOKEN_CONFIG = {
  mintAddress: process.env.NEXT_PUBLIC_TOKEN_MINT_ADDRESS || '',
  symbol: '$AWA',
  pumpFunUrl: (mint: string) => `https://pump.fun/coin/${mint}`,
};
