-- Migration: 002_add_wallet_address
-- Add wallet_address column to users table for wallet-based claims

ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(64) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
