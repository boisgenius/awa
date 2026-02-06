/**
 * Solana Wallet Generation and Encryption
 * Generate and encrypt agent wallets
 */

import { Keypair } from '@solana/web3.js';
import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from 'crypto';

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';
const SALT = 'claw_academy_salt'; // In production, use a unique salt per key
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export interface GeneratedWallet {
  publicKey: string;
  encryptedPrivateKey: string;
}

/**
 * Generate encryption key from password/master key
 */
function deriveKey(masterKey: string): Buffer {
  return scryptSync(masterKey, SALT, KEY_LENGTH);
}

/**
 * Encrypt private key for secure storage
 */
function encryptPrivateKey(privateKey: Uint8Array, masterKey: string): string {
  const key = deriveKey(masterKey);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const privateKeyHex = Buffer.from(privateKey).toString('hex');
  let encrypted = cipher.update(privateKeyHex, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt private key from storage
 */
export function decryptPrivateKey(encryptedKey: string, masterKey: string): Uint8Array {
  const [ivHex, authTagHex, encrypted] = encryptedKey.split(':');

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted key format');
  }

  const key = deriveKey(masterKey);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return Buffer.from(decrypted, 'hex');
}

/**
 * Generate a new Solana wallet for an agent
 */
export function generateAgentWallet(): GeneratedWallet {
  const encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('WALLET_ENCRYPTION_KEY not configured');
  }

  // Generate new keypair
  const keypair = Keypair.generate();

  // Encrypt the private key
  const encryptedPrivateKey = encryptPrivateKey(keypair.secretKey, encryptionKey);

  return {
    publicKey: keypair.publicKey.toBase58(),
    encryptedPrivateKey,
  };
}

/**
 * Restore a Keypair from encrypted storage
 */
export function restoreKeypair(encryptedKey: string): Keypair {
  const encryptionKey = process.env.WALLET_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('WALLET_ENCRYPTION_KEY not configured');
  }

  const privateKey = decryptPrivateKey(encryptedKey, encryptionKey);
  return Keypair.fromSecretKey(privateKey);
}

/**
 * Validate a Solana public key
 */
export function isValidPublicKey(publicKey: string): boolean {
  try {
    // Attempt to create a PublicKey - will throw if invalid
    const { PublicKey } = require('@solana/web3.js');
    new PublicKey(publicKey);
    return true;
  } catch {
    return false;
  }
}
