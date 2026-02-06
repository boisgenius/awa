import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
} from '@solana/web3.js';

// Default to devnet for development
const DEFAULT_RPC_URL = 'https://api.devnet.solana.com';

let connection: Connection | null = null;

export function getConnection(): Connection {
  if (!connection) {
    const rpcUrl = process.env.SOLANA_RPC_URL || DEFAULT_RPC_URL;
    connection = new Connection(rpcUrl, 'confirmed');
  }
  return connection;
}

/**
 * Get SOL balance for a wallet
 */
export async function getBalance(publicKey: string): Promise<number> {
  const conn = getConnection();
  const pubkey = new PublicKey(publicKey);
  const balance = await conn.getBalance(pubkey);
  return balance / LAMPORTS_PER_SOL;
}

/**
 * Create a transfer transaction
 */
export async function createTransferTransaction(
  fromPublicKey: string,
  toPublicKey: string,
  amountSol: number
): Promise<Transaction> {
  const conn = getConnection();
  const from = new PublicKey(fromPublicKey);
  const to = new PublicKey(toPublicKey);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from,
      toPubkey: to,
      lamports: Math.floor(amountSol * LAMPORTS_PER_SOL),
    })
  );

  const { blockhash } = await conn.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = from;

  return transaction;
}

/**
 * Sign and send a transaction
 */
export async function signAndSendTransaction(
  transaction: Transaction,
  signerKeypair: Keypair
): Promise<string> {
  const conn = getConnection();
  transaction.sign(signerKeypair);
  const signature = await conn.sendRawTransaction(transaction.serialize());
  await conn.confirmTransaction(signature, 'confirmed');
  return signature;
}

/**
 * Verify a transaction signature
 */
export async function verifyTransaction(signature: string): Promise<{
  confirmed: boolean;
  slot?: number;
  error?: string;
}> {
  const conn = getConnection();
  try {
    const result = await conn.getSignatureStatus(signature);
    if (result.value?.confirmationStatus === 'confirmed' ||
        result.value?.confirmationStatus === 'finalized') {
      return { confirmed: true, slot: result.value.slot };
    }
    return { confirmed: false, error: 'Transaction not confirmed' };
  } catch (error) {
    return {
      confirmed: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Decrypt an encrypted private key (placeholder - implement with proper encryption)
 */
export function decryptPrivateKey(encryptedKey: string): Uint8Array {
  // TODO: Implement proper decryption using WALLET_ENCRYPTION_KEY
  // This is a placeholder that should be replaced with actual decryption logic
  const key = process.env.WALLET_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Wallet encryption key not configured');
  }

  // For now, assume the key is base64 encoded
  return Buffer.from(encryptedKey, 'base64');
}

/**
 * Create a Keypair from decrypted private key
 */
export function createKeypairFromPrivateKey(privateKey: Uint8Array): Keypair {
  return Keypair.fromSecretKey(privateKey);
}
