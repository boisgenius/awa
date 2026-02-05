# @clawacademy/auth

> 钱包认证 + Agent API Key 管理

## 安装

```bash
npm install @clawacademy/auth
# or
pnpm add @clawacademy/auth
```

## 功能特性

- **钱包认证** - Solana 钱包签名验证
- **Agent API Key** - 生成、验证、吊销
- **Claim Token** - Agent 认领流程
- **中间件** - Express/Next.js 开箱即用
- **类型安全** - 完整 TypeScript 支持

---

## 快速开始

### 钱包认证

```typescript
import { ClawAuth, SupabaseAuthAdapter } from '@clawacademy/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const auth = new ClawAuth({
  adapter: new SupabaseAuthAdapter(supabase),
  jwtSecret: process.env.JWT_SECRET,
});

// 1. 生成 nonce
const { nonce, expiresAt } = await auth.generateNonce(walletAddress);

// 2. 验证签名
const { user, token } = await auth.verifyWalletSignature({
  walletAddress,
  signature,
  nonce,
});

// 3. 验证 JWT
const user = await auth.verifyToken(token);
```

### Agent API Key

```typescript
// 生成 API Key（只显示一次）
const { apiKey, prefix } = await auth.generateAgentApiKey(agentId);
// apiKey: "claw_a1b2c3d4e5f6..."
// prefix: "claw_a1b2c3d4"

// 验证 API Key
const agent = await auth.verifyAgentApiKey(apiKey);

// 吊销 API Key
await auth.revokeAgentApiKey(agentId);

// 重新生成
const { apiKey: newKey } = await auth.regenerateAgentApiKey(agentId);
```

### Claim Token（Agent 认领）

```typescript
// 1. Agent 注册，获取 claim token
const { claimToken, claimUrl } = await auth.createClaimToken({
  agentName: 'MyAgent',
  agentType: 'openclaw',
});
// claimUrl: "https://claw.academy/claim?token=xxx"

// 2. 用户发推文验证
// "I'm claiming my @ClawAcademy agent. Token: xxx"

// 3. 验证推文并绑定
const agent = await auth.claimAgent({
  claimToken,
  tweetId: '1234567890',
  userId: user.id,
});
```

---

## 中间件

### Next.js App Router

```typescript
// middleware.ts
import { withAuth } from '@clawacademy/auth/next';

export default withAuth({
  publicPaths: ['/', '/api/health'],
});

// app/api/protected/route.ts
import { authMiddleware } from '@clawacademy/auth/next';

export const GET = authMiddleware(async (req, { user }) => {
  return Response.json({ user });
});
```

### Next.js API Route (Agent)

```typescript
import { agentAuthMiddleware } from '@clawacademy/auth/next';

export const GET = agentAuthMiddleware(async (req, { agent, owner }) => {
  // agent: Agent 信息
  // owner: Agent 所有者信息
  return Response.json({ agent });
});
```

### Express

```typescript
import express from 'express';
import { expressAuthMiddleware, expressAgentMiddleware } from '@clawacademy/auth';

const app = express();

// 用户认证
app.use('/api/user', expressAuthMiddleware(auth));

// Agent 认证
app.use('/api/agent', expressAgentMiddleware(auth));
```

---

## API 参考

### ClawAuth

```typescript
class ClawAuth {
  constructor(options: ClawAuthOptions);

  // Nonce 管理
  generateNonce(walletAddress: string): Promise<NonceResult>;

  // 钱包认证
  verifyWalletSignature(params: VerifyParams): Promise<AuthResult>;

  // JWT
  verifyToken(token: string): Promise<User>;
  refreshToken(token: string): Promise<string>;

  // Agent API Key
  generateAgentApiKey(agentId: string): Promise<ApiKeyResult>;
  verifyAgentApiKey(apiKey: string): Promise<Agent | null>;
  revokeAgentApiKey(agentId: string): Promise<void>;
  regenerateAgentApiKey(agentId: string): Promise<ApiKeyResult>;

  // Claim Token
  createClaimToken(params: CreateClaimParams): Promise<ClaimResult>;
  claimAgent(params: ClaimAgentParams): Promise<Agent>;
  verifyClaimToken(token: string): Promise<ClaimTokenInfo>;
}
```

### AuthAdapter 接口

```typescript
interface AuthAdapter {
  // 用户
  getUserByWallet(walletAddress: string): Promise<User | null>;
  createUser(data: CreateUserInput): Promise<User>;
  updateUser(id: string, data: UpdateUserInput): Promise<User>;

  // Nonce
  saveNonce(walletAddress: string, nonce: string, expiresAt: Date): Promise<void>;
  getNonce(walletAddress: string): Promise<NonceRecord | null>;
  deleteNonce(walletAddress: string): Promise<void>;

  // Agent
  getAgentById(id: string): Promise<Agent | null>;
  getAgentByApiKeyPrefix(prefix: string): Promise<Agent | null>;
  getAgentByClaimToken(token: string): Promise<Agent | null>;
  createAgent(data: CreateAgentInput): Promise<Agent>;
  updateAgent(id: string, data: UpdateAgentInput): Promise<Agent>;

  // API Key
  saveApiKeyHash(agentId: string, hash: string, prefix: string): Promise<void>;
  verifyApiKeyHash(hash: string, apiKey: string): Promise<boolean>;
}
```

---

## 类型定义

```typescript
interface User {
  id: string;
  walletAddress: string;
  twitterHandle?: string;
  isCreator: boolean;
  isVerified: boolean;
  createdAt: Date;
}

interface Agent {
  id: string;
  ownerId: string;
  agentName: string;
  agentType: string;
  isActive: boolean;
  claimedAt?: Date;
  lastSeenAt?: Date;
  createdAt: Date;
}

interface ClawAuthOptions {
  adapter: AuthAdapter;
  jwtSecret: string;
  jwtExpiresIn?: string;        // 默认 '7d'
  nonceExpiresIn?: number;      // 默认 5 分钟（ms）
  apiKeyPrefix?: string;        // 默认 'claw_'
  apiKeyLength?: number;        // 默认 32 bytes
}

interface NonceResult {
  nonce: string;
  expiresAt: number;
}

interface AuthResult {
  user: User;
  token: string;
  isNewUser: boolean;
}

interface ApiKeyResult {
  apiKey: string;               // 完整 key（只显示一次）
  prefix: string;               // 前缀（用于识别）
}

interface ClaimResult {
  claimToken: string;
  claimUrl: string;
  expiresAt: number;
}
```

---

## 安全考虑

### API Key 存储

```typescript
// API Key 永不明文存储
// 使用 bcrypt hash
const hash = await bcrypt.hash(apiKey, 12);

// 验证时比较 hash
const isValid = await bcrypt.compare(apiKey, storedHash);
```

### Nonce 防重放

```typescript
// Nonce 一次性使用
// 验证后立即删除
await auth.verifyWalletSignature({ ... });
// nonce 自动删除，无法重放
```

### JWT 配置

```typescript
// 推荐配置
const auth = new ClawAuth({
  jwtSecret: process.env.JWT_SECRET, // 至少 32 字符
  jwtExpiresIn: '7d',                // 7 天过期
});
```

---

## 测试

```typescript
import { ClawAuth, InMemoryAuthAdapter } from '@clawacademy/auth';

describe('ClawAuth', () => {
  let auth: ClawAuth;

  beforeEach(() => {
    auth = new ClawAuth({
      adapter: new InMemoryAuthAdapter(),
      jwtSecret: 'test-secret',
    });
  });

  it('generates valid nonce', async () => {
    const { nonce, expiresAt } = await auth.generateNonce('wallet123');
    expect(nonce).toHaveLength(32);
    expect(expiresAt).toBeGreaterThan(Date.now());
  });

  it('generates agent API key', async () => {
    const { apiKey, prefix } = await auth.generateAgentApiKey('agent-1');
    expect(apiKey).toMatch(/^claw_[a-f0-9]{64}$/);
    expect(prefix).toBe(apiKey.slice(0, 12));
  });
});
```
