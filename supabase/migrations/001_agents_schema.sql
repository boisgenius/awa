-- Claw Academy Database Schema
-- Migration: 001_agents_schema
-- Created: 2026-02-06
-- Based on: docs/后端架构设计.md + Agent系统实现计划.md

-- ============================================
-- 启用必要的扩展
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 枚举类型
-- ============================================
DO $$ BEGIN
  CREATE TYPE skill_category AS ENUM (
    'research', 'finance', 'coding', 'security', 'creative', 'comms'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE skill_status AS ENUM ('live', 'dev', 'deprecated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_token AS ENUM ('SOL', 'CLAW', 'USDC');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE purchase_status AS ENUM ('confirmed', 'refunded', 'pending', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE agent_status AS ENUM ('pending_claim', 'active', 'suspended', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Users 表 - 用户账户（Agent 所有者）
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  twitter_id VARCHAR(32) UNIQUE,
  twitter_handle VARCHAR(50) UNIQUE,
  twitter_verified_at TIMESTAMPTZ,
  display_name VARCHAR(50),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_twitter_handle ON users(twitter_handle);

-- ============================================
-- Agents 表 - AI 智能体
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Agent 身份
  name VARCHAR(32) UNIQUE NOT NULL,
  description TEXT,
  agent_type VARCHAR(50) DEFAULT 'openclaw',

  -- API 认证
  api_key_hash VARCHAR(64) NOT NULL,
  api_key_prefix VARCHAR(16) NOT NULL,

  -- Solana 钱包
  wallet_public_key VARCHAR(64) NOT NULL,
  wallet_encrypted_key TEXT NOT NULL,

  -- 状态管理
  status agent_status DEFAULT 'pending_claim',

  -- 认领信息
  claim_token VARCHAR(64) UNIQUE,
  claim_token_expires_at TIMESTAMPTZ,
  verification_code VARCHAR(16),
  claim_tweet_id VARCHAR(30),

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,

  -- 约束
  CONSTRAINT valid_name CHECK (name ~ '^[a-zA-Z0-9_]{2,32}$')
);

-- Agents 索引
CREATE INDEX IF NOT EXISTS idx_agents_owner ON agents(owner_id);
CREATE INDEX IF NOT EXISTS idx_agents_api_key_prefix ON agents(api_key_prefix);
CREATE INDEX IF NOT EXISTS idx_agents_claim_token ON agents(claim_token) WHERE claim_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);

-- ============================================
-- Authors 表 - 技能创作者
-- ============================================
CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  author_name VARCHAR(50) NOT NULL,
  bio TEXT,
  is_verified BOOLEAN DEFAULT false,
  total_skills INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_authors_user ON authors(user_id);

-- ============================================
-- Skills 表 - 技能模块
-- ============================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  category skill_category NOT NULL,
  status skill_status DEFAULT 'dev',
  price DECIMAL(10, 4) NOT NULL DEFAULT 0,
  currency payment_token DEFAULT 'SOL',
  content JSONB,  -- 存储 SKILL.md 和相关文件
  version VARCHAR(20) DEFAULT '1.0.0',
  icon_emoji VARCHAR(10),
  features TEXT[],
  rating DECIMAL(2, 1) DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_status ON skills(status);
CREATE INDEX IF NOT EXISTS idx_skills_author ON skills(author_id);
CREATE INDEX IF NOT EXISTS idx_skills_slug ON skills(slug);

-- ============================================
-- Purchases 表 - 购买记录
-- ============================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,

  -- 价格信息
  price DECIMAL(18, 9) NOT NULL,
  currency payment_token DEFAULT 'SOL',

  -- 交易信息
  tx_signature VARCHAR(128),
  tx_status purchase_status DEFAULT 'pending',

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,

  -- 约束
  CONSTRAINT unique_agent_skill_purchase UNIQUE (agent_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_agent ON purchases(agent_id);
CREATE INDEX IF NOT EXISTS idx_purchases_skill ON purchases(skill_id);
CREATE INDEX IF NOT EXISTS idx_purchases_tx_status ON purchases(tx_status);

-- ============================================
-- Favorites 表 - 技能收藏
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 约束
  CONSTRAINT unique_agent_skill_favorite UNIQUE (agent_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_agent ON favorites(agent_id);
CREATE INDEX IF NOT EXISTS idx_favorites_skill ON favorites(skill_id);

-- ============================================
-- Row Level Security (RLS) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Service role 完全访问
CREATE POLICY "Service role full access - users" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - agents" ON agents
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - authors" ON authors
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - skills" ON skills
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - purchases" ON purchases
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access - favorites" ON favorites
  FOR ALL USING (auth.role() = 'service_role');

-- 公开读取 skills
CREATE POLICY "Public read skills" ON skills
  FOR SELECT USING (status = 'live');

-- ============================================
-- 辅助函数
-- ============================================

-- 清理过期的 claim tokens
CREATE OR REPLACE FUNCTION cleanup_expired_claims()
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE agents
  SET
    status = 'expired',
    claim_token = NULL,
    claim_token_expires_at = NULL
  WHERE
    status = 'pending_claim'
    AND claim_token_expires_at < NOW();

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新 Agent 最后活跃时间
CREATE OR REPLACE FUNCTION update_agent_last_active(agent_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE agents
  SET last_active_at = NOW()
  WHERE id = agent_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表添加更新时间戳触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 注释
-- ============================================
COMMENT ON TABLE users IS '用户账户表 - Agent 所有者';
COMMENT ON TABLE agents IS 'AI Agent 注册信息表';
COMMENT ON TABLE authors IS '技能创作者表';
COMMENT ON TABLE skills IS '技能模块表';
COMMENT ON TABLE purchases IS 'Agent 技能购买记录';
COMMENT ON TABLE favorites IS 'Agent 技能收藏列表';

COMMENT ON COLUMN agents.api_key_hash IS 'API Key 的 SHA256 哈希值';
COMMENT ON COLUMN agents.api_key_prefix IS 'API Key 前缀用于快速识别 (claw_sk_xxx...)';
COMMENT ON COLUMN agents.wallet_encrypted_key IS 'AES-256-GCM 加密的私钥';
COMMENT ON COLUMN agents.claim_token IS '一次性 claim token，验证后删除';
COMMENT ON COLUMN agents.verification_code IS '人类可读的验证码 (如 coral-X7K9)';
COMMENT ON COLUMN skills.content IS 'JSONB 格式存储技能内容和相关文件';
COMMENT ON COLUMN purchases.tx_signature IS 'Solana 交易签名';
