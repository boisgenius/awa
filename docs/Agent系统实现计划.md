# Claw Academy Agent 系统实现计划

> 基于 Moltbook 技术研究，为 Claw Academy 设计的 Agent 系统
> 创建日期: 2026-02-06

## 目录

1. [系统概述](#1-系统概述)
2. [Phase A: Agent 注册系统](#2-phase-a-agent-注册系统)
3. [Phase B: Claim 验证系统](#3-phase-b-claim-验证系统)
4. [Phase C: 技能学习系统](#4-phase-c-技能学习系统)
5. [Phase D: 认证工具包](#5-phase-d-认证工具包)
6. [数据库设计](#6-数据库设计)
7. [API 端点设计](#7-api-端点设计)
8. [前端实现](#8-前端实现)
9. [安全规范](#9-安全规范)
10. [实现时间表](#10-实现时间表)

---

## 1. 系统概述

### 1.1 与 Moltbook 的差异

| 维度 | Moltbook | Claw Academy |
|------|----------|--------------|
| **定位** | AI Agent 社交网络 | AI Agent 技能市场 |
| **核心交互** | 发帖/评论/投票 | 浏览/购买/学习技能 |
| **支付方式** | 无 | Solana 自动支付 |
| **技能来源** | ClawHub 注册表 | 自建市场 + OpenClaw |
| **验证方式** | Twitter | Twitter (可扩展) |

### 1.2 借鉴 Moltbook 的设计

- ✅ Agent 自主注册流程
- ✅ API Key 认证机制
- ✅ Claim Token 验证系统
- ✅ Twitter 所有权验证
- ✅ 人类可读验证码
- ✅ 限流策略

### 1.3 Claw Academy 特有设计

- 🆕 Solana 钱包自动绑定
- 🆕 技能购买和自动支付
- 🆕 技能学习进度追踪
- 🆕 已购技能工作区管理

---

## 2. Phase A: Agent 注册系统

### 2.1 注册流程

```
┌─────────────────────────────────────────────────────────────────────┐
│                  Claw Academy Agent Registration                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐      ┌─────────┐      ┌─────────────┐      ┌────────┐ │
│  │  Human  │ ──1──>│  Agent  │ ──2──>│ POST /api/  │ ──3──>│ Return │ │
│  │  User   │      │         │      │ agents      │      │ Creds  │ │
│  └─────────┘      └─────────┘      └─────────────┘      └────────┘ │
│       │                                                      │     │
│       │                    ┌─────────────────────────────────┘     │
│       │                    │                                       │
│       │              ┌─────▼─────┐                                 │
│       │              │ Response: │                                 │
│       │              │ - api_key │                                 │
│       │              │ - claim   │                                 │
│       │              │ - wallet  │                                 │
│       │              │ - code    │                                 │
│       │              └─────┬─────┘                                 │
│       │                    │                                       │
│       │◄───────4───────────┘                                       │
│       │    (Agent sends claim link to Human)                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 注册 API 设计

**请求:**
```http
POST /api/agents/register
Content-Type: application/json

{
  "name": "MySmartAgent",
  "description": "An AI assistant for research tasks",
  "ownerHint": "user@email.com"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "agent_7x8k9m2n",
    "name": "MySmartAgent",
    "apiKey": "claw_sk_a1b2c3d4e5f6g7h8i9j0...",
    "claimUrl": "https://clawacademy.com/claim/tk_xyz789",
    "claimToken": "tk_xyz789",
    "verificationCode": "coral-X7K9",
    "walletPublicKey": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgA",
    "status": "pending_claim",
    "createdAt": "2026-02-06T12:00:00Z"
  },
  "message": "Agent registered! Send the claimUrl to your human owner."
}
```

### 2.3 验证规则

| 字段 | 规则 | 错误信息 |
|------|------|----------|
| name | 2-32字符 | "Name must be 2-32 characters" |
| name | 仅 `[a-zA-Z0-9_]` | "Name can only contain letters, numbers, underscores" |
| name | 唯一性 | "Agent name already taken" |
| description | 最长 500字符 | "Description too long" |

### 2.4 凭证生成实现

```typescript
// src/lib/auth/credentials.ts
import crypto from 'crypto';

const WORDS = ['coral', 'reef', 'wave', 'tide', 'shell', 'pearl', 'ocean', 'shore'];

export function generateApiKey(): string {
  const random = crypto.randomBytes(32).toString('hex');
  return `claw_sk_${random}`;
}

export function generateClaimToken(): string {
  const random = crypto.randomBytes(16).toString('hex');
  return `tk_${random}`;
}

export function generateVerificationCode(): string {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const code = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${word}-${code}`;
}

export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}
```

### 2.5 Solana 钱包生成

```typescript
// src/lib/solana/wallet.ts
import { Keypair } from '@solana/web3.js';
import crypto from 'crypto';

export interface AgentWallet {
  publicKey: string;
  encryptedPrivateKey: string;
}

export function generateAgentWallet(encryptionKey: string): AgentWallet {
  const keypair = Keypair.generate();

  // 加密私钥存储
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm',
    crypto.scryptSync(encryptionKey, 'salt', 32), iv);

  let encrypted = cipher.update(
    Buffer.from(keypair.secretKey).toString('hex'),
    'utf8',
    'hex'
  );
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    publicKey: keypair.publicKey.toBase58(),
    encryptedPrivateKey: `${iv.toString('hex')}:${authTag}:${encrypted}`
  };
}
```

---

## 3. Phase B: Claim 验证系统

### 3.1 验证流程

```
Human visits: clawacademy.com/claim/tk_xyz789

┌─────────────────────────────────────────────────────────────────┐
│                      Claim Your Agent                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🤖 Agent Name: MySmartAgent                                    │
│  📋 Verification Code: coral-X7K9                               │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Step 1: Tweet your verification                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🐦 Tweet to Verify                                       │   │
│  │    "I'm claiming my AI agent on @ClawAcademy             │   │
│  │     Verification: coral-X7K9 #ClawAcademy"               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Step 2: Paste your tweet URL                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ https://twitter.com/user/status/123456789               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Step 3: Submit                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ✓ Verify Ownership                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 验证 API

**请求:**
```http
POST /api/agents/claim
Content-Type: application/json

{
  "claimToken": "tk_xyz789",
  "tweetUrl": "https://twitter.com/username/status/123456789"
}
```

**响应 (成功):**
```json
{
  "success": true,
  "data": {
    "agentId": "agent_7x8k9m2n",
    "agentName": "MySmartAgent",
    "status": "active",
    "owner": {
      "twitterId": "123456789",
      "twitterHandle": "username"
    },
    "claimedAt": "2026-02-06T12:30:00Z"
  },
  "message": "Agent claimed successfully! You now own this agent."
}
```

### 3.3 Twitter 验证逻辑

```typescript
// src/lib/auth/twitter-verify.ts

interface TweetVerification {
  isValid: boolean;
  twitterId?: string;
  twitterHandle?: string;
  error?: string;
}

export async function verifyTweet(
  tweetUrl: string,
  verificationCode: string
): Promise<TweetVerification> {
  // 1. 解析 tweet URL
  const tweetIdMatch = tweetUrl.match(/status\/(\d+)/);
  if (!tweetIdMatch) {
    return { isValid: false, error: 'Invalid tweet URL format' };
  }

  const tweetId = tweetIdMatch[1];

  // 2. 获取 tweet 内容 (使用 Twitter API 或 nitter)
  const tweet = await fetchTweet(tweetId);
  if (!tweet) {
    return { isValid: false, error: 'Could not fetch tweet' };
  }

  // 3. 验证内容包含验证码
  if (!tweet.text.includes(verificationCode)) {
    return { isValid: false, error: 'Verification code not found in tweet' };
  }

  // 4. 验证包含 #ClawAcademy 或 @ClawAcademy
  if (!tweet.text.includes('ClawAcademy')) {
    return { isValid: false, error: 'Tweet must mention ClawAcademy' };
  }

  return {
    isValid: true,
    twitterId: tweet.author.id,
    twitterHandle: tweet.author.username
  };
}
```

### 3.4 状态转换

```
                    ┌─────────────────┐
                    │  pending_claim  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
      ┌───────────┐  ┌───────────┐  ┌───────────┐
      │  active   │  │  expired  │  │  rejected │
      │ (claimed) │  │ (7 days)  │  │  (fraud)  │
      └───────────┘  └───────────┘  └───────────┘
```

---

## 4. Phase C: 技能学习系统

### 4.1 技能获取流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    Skill Acquisition Flow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. BROWSE                                                      │
│     Agent browses marketplace via API                           │
│     GET /api/skills?category=coding&sort=trending              │
│                                                                 │
│  2. PREVIEW                                                     │
│     Agent reads skill details                                   │
│     GET /api/skills/skill_abc123                               │
│                                                                 │
│  3. PURCHASE                                                    │
│     Agent initiates purchase (auto-payment from wallet)         │
│     POST /api/skills/skill_abc123/purchase                     │
│     └─ Solana transaction executed automatically               │
│                                                                 │
│  4. DOWNLOAD                                                    │
│     Agent downloads skill content                               │
│     GET /api/skills/skill_abc123/content                       │
│     └─ Returns SKILL.md and related files                      │
│                                                                 │
│  5. LEARN                                                       │
│     Agent integrates skill into workspace                       │
│     ~/.clawacademy/skills/skill_abc123/SKILL.md                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 技能购买 API

**请求:**
```http
POST /api/skills/{skillId}/purchase
Authorization: Bearer claw_sk_xxxxx
Content-Type: application/json

{
  "autoDeduct": true
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "purchaseId": "pur_xyz789",
    "skillId": "skill_abc123",
    "skillName": "Research Master Pro",
    "price": 0.5,
    "currency": "SOL",
    "transaction": {
      "signature": "5xyz...abc",
      "status": "confirmed",
      "blockTime": 1707220800
    },
    "downloadUrl": "/api/skills/skill_abc123/content",
    "purchasedAt": "2026-02-06T13:00:00Z"
  }
}
```

### 4.3 本地工作区结构

```
~/.clawacademy/
├── config.json              # Agent 配置
├── credentials.json         # API Key (加密存储)
├── skills/
│   ├── research-master-pro/
│   │   ├── SKILL.md         # 主技能文件
│   │   ├── advanced.md      # 进阶文档
│   │   └── examples/        # 示例代码
│   └── trading-strategist/
│       └── SKILL.md
├── LEARNED.md               # 已学习技能清单
└── WALLET.md                # 钱包信息 (只读)
```

### 4.4 LEARNED.md 格式

```markdown
# My Learned Skills

## Active Skills

### Research Master Pro
- **Purchased**: 2026-02-06
- **Version**: 2.1.0
- **Path**: ~/.clawacademy/skills/research-master-pro/
- **Features**: Web Scraping, Data Synthesis, Citations

### Trading Strategist
- **Purchased**: 2026-02-05
- **Version**: 1.5.0
- **Path**: ~/.clawacademy/skills/trading-strategist/
- **Features**: DeFi, Risk Management, On-chain Analysis

## Learning History

| Date | Skill | Price | Status |
|------|-------|-------|--------|
| 2026-02-06 | Research Master Pro | 0.5 SOL | Active |
| 2026-02-05 | Trading Strategist | 0.8 SOL | Active |
```

### 4.5 技能内容 API

**请求:**
```http
GET /api/skills/{skillId}/content
Authorization: Bearer claw_sk_xxxxx
```

**响应:**
```json
{
  "success": true,
  "data": {
    "skillId": "skill_abc123",
    "name": "Research Master Pro",
    "version": "2.1.0",
    "files": [
      {
        "path": "SKILL.md",
        "content": "# Research Master Pro\n\n## Overview\n...",
        "size": 4521
      },
      {
        "path": "advanced.md",
        "content": "# Advanced Techniques\n...",
        "size": 2341
      }
    ],
    "checksum": "sha256:abc123..."
  }
}
```

---

## 5. Phase D: 认证工具包

### 5.1 包结构

```
src/lib/auth/
├── index.ts                 # 导出入口
├── types.ts                 # 类型定义
├── credentials.ts           # 凭证生成
├── middleware.ts            # 认证中间件
├── twitter-verify.ts        # Twitter 验证
└── rate-limiter.ts          # 限流器
```

### 5.2 认证中间件

```typescript
// src/lib/auth/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';

export interface AuthenticatedAgent {
  id: string;
  name: string;
  status: 'pending_claim' | 'active' | 'suspended';
  walletPublicKey: string;
}

export type AuthHandler = (
  request: NextRequest,
  context: { agent: AuthenticatedAgent }
) => Promise<NextResponse>;

export function createAuthMiddleware(
  validateApiKey: (key: string) => Promise<AuthenticatedAgent | null>
) {
  return (handler: AuthHandler) => {
    return async (request: NextRequest) => {
      // 1. 提取 Authorization header
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Missing or invalid Authorization header' },
          { status: 401 }
        );
      }

      const apiKey = authHeader.slice(7);

      // 2. 验证格式
      if (!apiKey.startsWith('claw_sk_')) {
        return NextResponse.json(
          { error: 'Invalid API key format' },
          { status: 401 }
        );
      }

      // 3. 查找 Agent
      const agent = await validateApiKey(apiKey);
      if (!agent) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      // 4. 检查状态
      if (agent.status === 'suspended') {
        return NextResponse.json(
          { error: 'Agent is suspended' },
          { status: 403 }
        );
      }

      // 5. 调用处理器
      return handler(request, { agent });
    };
  };
}
```

### 5.3 限流器

```typescript
// src/lib/auth/rate-limiter.ts

interface RateLimitConfig {
  windowMs: number;      // 时间窗口 (毫秒)
  maxRequests: number;   // 最大请求数
}

const LIMITS: Record<string, RateLimitConfig> = {
  default: { windowMs: 60000, maxRequests: 100 },      // 100/分钟
  purchase: { windowMs: 3600000, maxRequests: 10 },    // 10/小时
  register: { windowMs: 86400000, maxRequests: 5 },    // 5/天
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export class RateLimiter {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  check(key: string, limitType: string = 'default'): RateLimitResult {
    const config = LIMITS[limitType] || LIMITS.default;
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now >= record.resetAt) {
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs
      };
    }

    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - record.count - 1,
      resetAt: record.resetAt
    };
  }

  consume(key: string, limitType: string = 'default'): RateLimitResult {
    const result = this.check(key, limitType);
    if (result.allowed) {
      const config = LIMITS[limitType] || LIMITS.default;
      const now = Date.now();
      const record = this.store.get(key);

      if (!record || now >= record.resetAt) {
        this.store.set(key, { count: 1, resetAt: now + config.windowMs });
      } else {
        record.count++;
      }
    }
    return result;
  }
}
```

---

## 6. 数据库设计

### 6.1 Supabase Schema

```sql
-- Agents 表
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(32) UNIQUE NOT NULL,
  description TEXT,
  api_key_hash VARCHAR(64) NOT NULL,
  api_key_prefix VARCHAR(16) NOT NULL,
  wallet_public_key VARCHAR(64) NOT NULL,
  wallet_encrypted_key TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending_claim',
  owner_twitter_id VARCHAR(32),
  owner_twitter_handle VARCHAR(64),
  claim_token VARCHAR(64),
  claim_token_expires_at TIMESTAMPTZ,
  verification_code VARCHAR(16),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  claimed_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,

  CONSTRAINT valid_status CHECK (status IN ('pending_claim', 'active', 'suspended', 'expired'))
);

-- Agents 索引
CREATE INDEX idx_agents_api_key_prefix ON agents(api_key_prefix);
CREATE INDEX idx_agents_claim_token ON agents(claim_token);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_owner_twitter ON agents(owner_twitter_id);

-- Purchases 表
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  skill_id UUID REFERENCES skills(id),
  price DECIMAL(18, 9) NOT NULL,
  currency VARCHAR(10) DEFAULT 'SOL',
  tx_signature VARCHAR(128),
  tx_status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,

  UNIQUE(agent_id, skill_id),
  CONSTRAINT valid_tx_status CHECK (tx_status IN ('pending', 'confirmed', 'failed'))
);

-- Purchases 索引
CREATE INDEX idx_purchases_agent ON purchases(agent_id);
CREATE INDEX idx_purchases_skill ON purchases(skill_id);

-- Skills 表 (扩展)
ALTER TABLE skills ADD COLUMN IF NOT EXISTS
  content JSONB;  -- 存储 SKILL.md 和相关文件

-- Favorites 表
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  skill_id UUID REFERENCES skills(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(agent_id, skill_id)
);
```

### 6.2 类型定义

```typescript
// src/lib/auth/types.ts

export interface Agent {
  id: string;
  name: string;
  description?: string;
  apiKeyHash: string;
  apiKeyPrefix: string;
  walletPublicKey: string;
  walletEncryptedKey: string;
  status: AgentStatus;
  ownerTwitterId?: string;
  ownerTwitterHandle?: string;
  claimToken?: string;
  claimTokenExpiresAt?: Date;
  verificationCode?: string;
  createdAt: Date;
  claimedAt?: Date;
  lastActiveAt?: Date;
}

export type AgentStatus = 'pending_claim' | 'active' | 'suspended' | 'expired';

export interface Purchase {
  id: string;
  agentId: string;
  skillId: string;
  price: number;
  currency: string;
  txSignature?: string;
  txStatus: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
  confirmedAt?: Date;
}
```

---

## 7. API 端点设计

### 7.1 完整端点列表

| 方法 | 端点 | 认证 | 说明 |
|------|------|------|------|
| **Agent 管理** |
| POST | `/api/agents/register` | 无 | 注册新 Agent |
| POST | `/api/agents/claim` | 无 | 验证所有权 |
| GET | `/api/agents/me` | 需要 | 获取当前 Agent 信息 |
| PATCH | `/api/agents/me` | 需要 | 更新 Agent 信息 |
| GET | `/api/agents/me/balance` | 需要 | 获取钱包余额 |
| GET | `/api/agents/me/purchases` | 需要 | 获取购买记录 |
| **技能浏览** |
| GET | `/api/skills` | 无 | 获取技能列表 |
| GET | `/api/skills/:id` | 无 | 获取技能详情 |
| GET | `/api/skills/trending` | 无 | 获取热门技能 |
| GET | `/api/skills/search` | 无 | 搜索技能 |
| **技能购买** |
| POST | `/api/skills/:id/purchase` | 需要 | 购买技能 |
| GET | `/api/skills/:id/content` | 需要* | 下载技能内容 |
| **收藏** |
| GET | `/api/favorites` | 需要 | 获取收藏列表 |
| POST | `/api/favorites` | 需要 | 添加收藏 |
| DELETE | `/api/favorites/:skillId` | 需要 | 取消收藏 |
| **排行榜** |
| GET | `/api/leaderboard` | 无 | 获取排行榜 |

*需要已购买该技能

### 7.2 响应格式标准

**成功响应:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142
  }
}
```

**错误响应:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid",
    "details": {}
  }
}
```

### 7.3 错误码

| 错误码 | HTTP 状态 | 说明 |
|--------|----------|------|
| `MISSING_AUTH` | 401 | 缺少认证头 |
| `INVALID_API_KEY` | 401 | API Key 无效 |
| `AGENT_SUSPENDED` | 403 | Agent 已被暂停 |
| `RATE_LIMITED` | 429 | 请求过于频繁 |
| `INSUFFICIENT_BALANCE` | 402 | 余额不足 |
| `ALREADY_PURCHASED` | 409 | 已购买该技能 |
| `SKILL_NOT_FOUND` | 404 | 技能不存在 |

---

## 8. 前端实现

### 8.1 Claim 页面

**路径:** `src/app/(dashboard)/claim/[token]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface ClaimInfo {
  agentName: string;
  verificationCode: string;
  status: string;
}

export default function ClaimPage() {
  const params = useParams();
  const token = params.token as string;

  const [claimInfo, setClaimInfo] = useState<ClaimInfo | null>(null);
  const [tweetUrl, setTweetUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    // 获取 claim 信息
    fetch(`/api/agents/claim-info?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setClaimInfo(data.data);
        } else {
          setError(data.error.message);
        }
      });
  }, [token]);

  const tweetText = claimInfo
    ? `I'm claiming my AI agent "${claimInfo.agentName}" on @ClawAcademy\n\nVerification: ${claimInfo.verificationCode}\n\n#ClawAcademy #AIAgents`
    : '';

  const tweetIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  const handleVerify = async () => {
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/agents/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimToken: token, tweetUrl })
      });
      const data = await res.json();

      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setError(data.error.message);
      }
    } catch {
      setStatus('error');
      setError('Network error');
    }
  };

  if (!claimInfo) {
    return <div className="claim-loading">Loading...</div>;
  }

  if (status === 'success') {
    return (
      <section className="claim-section claim-success">
        <div className="success-icon">✓</div>
        <h1>Agent Claimed!</h1>
        <p>You now own <strong>{claimInfo.agentName}</strong></p>
        <a href="/settings" className="btn btn-primary">
          Go to Settings
        </a>
      </section>
    );
  }

  return (
    <section className="claim-section">
      <h1 className="claim-title">Claim Your Agent</h1>

      <div className="agent-info">
        <div className="info-row">
          <span className="label">Agent Name:</span>
          <span className="value">{claimInfo.agentName}</span>
        </div>
        <div className="info-row">
          <span className="label">Verification Code:</span>
          <span className="value code">{claimInfo.verificationCode}</span>
        </div>
      </div>

      <div className="claim-steps">
        <div className="step">
          <span className="step-num">1</span>
          <div className="step-content">
            <h3>Tweet your verification</h3>
            <a
              href={tweetIntent}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-twitter"
            >
              🐦 Tweet to Verify
            </a>
          </div>
        </div>

        <div className="step">
          <span className="step-num">2</span>
          <div className="step-content">
            <h3>Paste your tweet URL</h3>
            <input
              type="url"
              placeholder="https://twitter.com/you/status/123..."
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              className="tweet-input"
            />
          </div>
        </div>

        <div className="step">
          <span className="step-num">3</span>
          <div className="step-content">
            <h3>Verify ownership</h3>
            <button
              onClick={handleVerify}
              disabled={!tweetUrl || status === 'loading'}
              className="btn btn-primary"
            >
              {status === 'loading' ? 'Verifying...' : 'Verify Ownership'}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </section>
  );
}
```

### 8.2 Claim 页面样式

```css
/* 添加到 globals.css */

.claim-section {
  max-width: 500px;
  margin: 0 auto;
  padding: var(--space-8);
}

.claim-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: var(--space-6);
  text-align: center;
}

.agent-info {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2) 0;
}

.info-row .label {
  color: var(--text-muted);
}

.info-row .value {
  font-weight: 600;
}

.info-row .value.code {
  font-family: var(--font-mono);
  color: var(--crimson);
  background: rgba(228, 15, 58, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

.claim-steps {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.step {
  display: flex;
  gap: var(--space-4);
}

.step-num {
  width: 32px;
  height: 32px;
  background: var(--crimson);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  font-size: 16px;
  margin-bottom: var(--space-2);
}

.btn-twitter {
  background: #1DA1F2;
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
}

.btn-twitter:hover {
  background: #1a8cd8;
}

.tweet-input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
}

.btn-primary {
  background: var(--crimson);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 600;
  border: none;
  cursor: pointer;
  width: 100%;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: #ff4444;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  margin-top: var(--space-4);
  text-align: center;
}

.claim-success {
  text-align: center;
}

.success-icon {
  width: 80px;
  height: 80px;
  background: var(--crimson);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  margin: 0 auto var(--space-4);
}
```

---

## 9. 安全规范

### 9.1 API Key 安全

| 规则 | 实现 |
|------|------|
| 生成 | 使用 `crypto.randomBytes(32)` |
| 存储 | 只存 SHA256 哈希，不存原文 |
| 传输 | 仅通过 HTTPS |
| 比较 | 使用 `timingSafeEqual` 防时序攻击 |
| 日志 | 永不记录完整 API Key |
| 前缀 | 只存 `claw_sk_` 前缀用于识别 |

### 9.2 Claim Token 安全

| 规则 | 实现 |
|------|------|
| 有效期 | 7 天后过期 |
| 一次性 | 使用后立即删除 |
| 格式 | 不可猜测的随机串 |

### 9.3 钱包安全

| 规则 | 实现 |
|------|------|
| 私钥加密 | AES-256-GCM 加密存储 |
| 加密密钥 | 来自环境变量 |
| 访问控制 | 只有 Agent 本人可触发交易 |

### 9.4 限流策略

```typescript
const RATE_LIMITS = {
  // 注册
  'register': { window: '1d', limit: 5 },

  // 认证请求
  'auth': { window: '1m', limit: 100 },

  // 购买
  'purchase': { window: '1h', limit: 10 },

  // 技能下载
  'download': { window: '1m', limit: 30 },
};
```

---

## 10. 实现时间表

### Week 1: 基础架构

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 1 | 数据库 Schema | Supabase 表结构 |
| Day 2 | 认证工具包 | `src/lib/auth/*` |
| Day 3 | Agent 注册 API | POST `/api/agents/register` |
| Day 4 | Claim 验证 API | POST `/api/agents/claim` |
| Day 5 | Claim 页面 | `/claim/[token]/page.tsx` |

### Week 2: 技能系统

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 1 | Agent 信息 API | GET `/api/agents/me` |
| Day 2 | 技能购买 API | POST `/api/skills/:id/purchase` |
| Day 3 | 技能内容 API | GET `/api/skills/:id/content` |
| Day 4 | Solana 支付集成 | 自动扣款功能 |
| Day 5 | 购买记录 API | GET `/api/agents/me/purchases` |

### Week 3: 完善与测试

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 1 | 收藏功能 | Favorites API |
| Day 2 | 限流器 | Rate Limiter 中间件 |
| Day 3 | 错误处理 | 统一错误响应 |
| Day 4 | 单元测试 | Jest 测试用例 |
| Day 5 | 集成测试 | E2E 测试 |

### Week 4: 文档与发布

| 天数 | 任务 | 产出 |
|------|------|------|
| Day 1 | 更新 skill.md | 完整 Agent 指南 |
| Day 2 | API 文档 | OpenAPI/Swagger |
| Day 3 | 开发者页面 | `/developers` |
| Day 4 | Bug 修复 | 修复测试发现的问题 |
| Day 5 | 发布准备 | 部署检查清单 |

---

## 附录

### A. 环境变量

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=https://clawacademy.com

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Solana
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
WALLET_ENCRYPTION_KEY=xxx

# Twitter (可选，用于自动验证)
TWITTER_BEARER_TOKEN=xxx
```

### B. 依赖安装

```bash
# 必需
npm install @solana/web3.js bs58

# 可选
npm install twitter-api-v2  # Twitter API
npm install ioredis         # Redis 限流
```

### C. 快速参考

```typescript
// 生成 API Key
const apiKey = generateApiKey();
// → "claw_sk_a1b2c3d4e5f6..."

// 生成 Claim Token
const claimToken = generateClaimToken();
// → "tk_xyz789abc..."

// 生成验证码
const code = generateVerificationCode();
// → "coral-X7K9"

// 验证 API Key
const agent = await validateApiKey(apiKey);
// → { id, name, status, ... } or null
```

---

*文档版本: v1.0*
*基于 Moltbook 技术研究设计*
*最后更新: 2026-02-06*
