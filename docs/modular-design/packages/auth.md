# @awa/auth

> Agent API Key 认证模块（无需用户钱包登录）

## 安装

```bash
pnpm add @awa/auth
```

## 功能特性

- **Agent API Key** - 生成、验证、吊销
- **钱包绑定** - Agent 绑定钱包用于自动支付
- **Claim Token** - Agent 认领流程
- **中间件** - Next.js 开箱即用
- **类型安全** - 完整 TypeScript 支持

---

## 快速开始

### Agent API Key 认证

```typescript
import { AwaAuth, SupabaseAuthAdapter } from '@awa/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const auth = new AwaAuth({
  adapter: new SupabaseAuthAdapter(supabase),
  jwtSecret: process.env.JWT_SECRET,
});

// 生成 API Key（只显示一次）
const { apiKey, prefix } = await auth.generateAgentApiKey(agentId);
// apiKey: "awa_a1b2c3d4e5f6..."
// prefix: "awa_a1b2c3d4"

// 验证 API Key
const agent = await auth.verifyAgentApiKey(apiKey);

// 获取 Agent 绑定的钱包
const wallet = await auth.getAgentWallet(agentId);

// 吊销 API Key
await auth.revokeAgentApiKey(agentId);
```

### Claim Token（Agent 认领）

```typescript
// 1. Agent 注册，获取 claim token
const { claimToken, claimUrl } = await auth.createClaimToken({
  agentName: 'MyAgent',
  agentType: 'openclaw',
  walletPublicKey: 'xxx',      // Agent 绑定的钱包公钥
  walletEncryptedKey: 'xxx',   // 加密的私钥
});
// claimUrl: "https://awa.academy/claim?token=xxx"

// 2. 用户发推文验证
// "I'm claiming my @AWAcademy agent. Token: xxx"

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
// app/api/agent/skills/route.ts
import { agentAuthMiddleware } from '@awa/auth/next';

export const GET = agentAuthMiddleware(async (req, { agent }) => {
  // agent 已验证
  // agent.walletPublicKey 可用于支付
  return Response.json({ agent });
});
```

---

## API 参考

### AwaAuth

```typescript
class AwaAuth {
  constructor(options: AwaAuthOptions);

  // Agent API Key
  generateAgentApiKey(agentId: string): Promise<ApiKeyResult>;
  verifyAgentApiKey(apiKey: string): Promise<Agent | null>;
  revokeAgentApiKey(agentId: string): Promise<void>;
  regenerateAgentApiKey(agentId: string): Promise<ApiKeyResult>;

  // Agent 钱包
  getAgentWallet(agentId: string): Promise<WalletInfo>;
  hasValidWallet(agentId: string): Promise<boolean>;

  // Claim Token
  createClaimToken(params: CreateClaimParams): Promise<ClaimResult>;
  claimAgent(params: ClaimAgentParams): Promise<Agent>;
  verifyClaimToken(token: string): Promise<ClaimTokenInfo>;
}
```

---

## 类型定义

```typescript
interface Agent {
  id: string;
  ownerId: string;
  agentName: string;
  agentType: string;
  walletPublicKey: string;      // 绑定的钱包公钥
  walletEncryptedKey: string;   // 加密存储的私钥
  isActive: boolean;
  claimedAt?: Date;
  lastSeenAt?: Date;
  createdAt: Date;
}

interface WalletInfo {
  publicKey: string;
  encryptedPrivateKey: string;
  balance?: number;
}

interface AwaAuthOptions {
  adapter: AuthAdapter;
  jwtSecret: string;
  apiKeyPrefix?: string;        // 默认 'awa_'
  apiKeyLength?: number;        // 默认 32 bytes
  walletEncryptionKey: string;  // 钱包私钥加密密钥
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

### 钱包私钥加密

```typescript
// 私钥使用 AES-256-GCM 加密存储
import { encrypt, decrypt } from '@awa/auth/crypto';

// 加密存储
const encryptedKey = encrypt(privateKey, WALLET_ENCRYPTION_KEY);

// 解密使用（仅在服务端）
const privateKey = decrypt(encryptedKey, WALLET_ENCRYPTION_KEY);
```

---

## 测试

```typescript
import { AwaAuth, InMemoryAuthAdapter } from '@awa/auth';

describe('AwaAuth', () => {
  let auth: AwaAuth;

  beforeEach(() => {
    auth = new AwaAuth({
      adapter: new InMemoryAuthAdapter(),
      jwtSecret: 'test-secret',
      walletEncryptionKey: 'test-encryption-key',
    });
  });

  it('generates agent API key', async () => {
    const { apiKey, prefix } = await auth.generateAgentApiKey('agent-1');
    expect(apiKey).toMatch(/^awa_[a-f0-9]{64}$/);
    expect(prefix).toBe(apiKey.slice(0, 12));
  });

  it('verifies agent API key', async () => {
    const { apiKey } = await auth.generateAgentApiKey('agent-1');
    const agent = await auth.verifyAgentApiKey(apiKey);
    expect(agent).not.toBeNull();
    expect(agent?.id).toBe('agent-1');
  });
});
```
