# @awa/payment

> Agent 自动支付 - 无需用户手动确认

## 安装

```bash
pnpm add @awa/payment
```

## 功能特性

- **自动支付** - Agent 绑定钱包，服务端签名
- **交易验证** - 验证 Solana 链上交易
- **购买记录** - 记录和查询购买历史
- **多币种** - SOL / USDC / $CLAW
- **余额查询** - 查询 Agent 钱包余额

---

## 快速开始

```typescript
import { AgentPaymentService, SupabasePaymentAdapter } from '@awa/payment';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection(process.env.SOLANA_RPC_URL);
const payment = new AgentPaymentService({
  adapter: new SupabasePaymentAdapter(supabase),
  solanaConnection: connection,
  treasuryWallet: process.env.TREASURY_WALLET,
  walletEncryptionKey: process.env.WALLET_ENCRYPTION_KEY,
});

// Agent 自动购买技能
const result = await payment.purchaseSkill(agentId, skillId);

if (result.success) {
  console.log('Transaction:', result.transactionSignature);
  console.log('Skill Content:', result.skillContent);
} else {
  console.error('Error:', result.error);
}

// 查询 Agent 钱包余额
const balance = await payment.getAgentBalance(agentId);
console.log('Balance:', balance, 'SOL');

// 获取购买记录
const purchases = await payment.getAgentPurchases(agentId);
```

---

## 自动支付流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Agent     │     │   API       │     │  Payment    │     │   Solana    │
│   (SDK)     │     │   Server    │     │  Service    │     │   Network   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. 购买请求       │                   │                   │
       │  (API Key)        │                   │                   │
       │──────────────────>│                   │                   │
       │                   │                   │                   │
       │                   │ 2. 验证 Agent     │                   │
       │                   │──────────────────>│                   │
       │                   │                   │                   │
       │                   │                   │ 3. 获取钱包密钥   │
       │                   │                   │ (解密私钥)        │
       │                   │                   │                   │
       │                   │                   │ 4. 构建交易       │
       │                   │                   │                   │
       │                   │                   │ 5. 签名并提交     │
       │                   │                   │──────────────────>│
       │                   │                   │                   │
       │                   │                   │ 6. 交易确认       │
       │                   │                   │<──────────────────│
       │                   │                   │                   │
       │                   │ 7. 返回结果       │                   │
       │                   │<──────────────────│                   │
       │                   │                   │                   │
       │ 8. 返回技能内容   │                   │                   │
       │<──────────────────│                   │                   │
```

---

## API 参考

### AgentPaymentService

```typescript
class AgentPaymentService {
  constructor(options: AgentPaymentOptions);

  // 自动支付（服务端签名）
  purchaseSkill(agentId: string, skillId: string): Promise<PurchaseResult>;

  // 余额查询
  getAgentBalance(agentId: string): Promise<number>;

  // 交易验证
  verifyTransaction(signature: string): Promise<TransactionResult>;

  // 购买记录
  getAgentPurchases(agentId: string): Promise<Purchase[]>;
  hasPurchased(agentId: string, skillId: string): Promise<boolean>;
}
```

---

## 类型定义

```typescript
type Currency = 'SOL' | 'USDC' | 'CLAW';
type PurchaseStatus = 'confirmed' | 'refunded';

interface PurchaseResult {
  success: boolean;
  transactionSignature?: string;
  skillContent?: string;        // 购买成功后返回技能内容
  error?: string;
}

interface Purchase {
  id: string;
  agentId: string;
  skillId: string;
  price: number;
  currency: Currency;
  txSignature: string;
  status: PurchaseStatus;
  createdAt: Date;
}

interface TransactionResult {
  signature: string;
  confirmed: boolean;
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
}

interface AgentPaymentOptions {
  adapter: PaymentAdapter;
  solanaConnection: Connection;
  treasuryWallet: string;
  walletEncryptionKey: string;  // 解密 Agent 钱包私钥
  confirmations?: number;       // 默认 1
}
```

---

## 安全考虑

### 私钥管理

```typescript
// Agent 钱包私钥加密存储在数据库
// 只在需要签名时解密，用完立即清除

const signTransaction = async (agentId: string, tx: Transaction) => {
  // 1. 获取加密的私钥
  const encryptedKey = await getAgentEncryptedKey(agentId);

  // 2. 解密私钥
  const privateKey = decrypt(encryptedKey, WALLET_ENCRYPTION_KEY);

  // 3. 签名交易
  const keypair = Keypair.fromSecretKey(privateKey);
  tx.sign(keypair);

  // 4. 清除内存中的私钥
  privateKey.fill(0);

  return tx;
};
```

### 交易验证

```typescript
// 验证交易详情
const txInfo = await payment.verifyTransaction(txSignature);

// 检查项
// 1. 交易已确认
// 2. 金额正确
// 3. 收款地址正确（treasury wallet）
// 4. 交易时间在有效期内
```

---

## API 示例

### 购买技能

```typescript
// app/api/purchases/route.ts
import { agentAuthMiddleware } from '@awa/auth/next';
import { payment } from '@/lib/payment';

export const POST = agentAuthMiddleware(async (req, { agent }) => {
  const { skillId } = await req.json();

  // 检查是否已购买
  if (await payment.hasPurchased(agent.id, skillId)) {
    return Response.json(
      { error: 'Already purchased' },
      { status: 400 }
    );
  }

  // 自动支付
  const result = await payment.purchaseSkill(agent.id, skillId);

  if (!result.success) {
    return Response.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return Response.json({
    transactionSignature: result.transactionSignature,
    skillContent: result.skillContent,
  });
});
```

### 查询余额

```typescript
// app/api/agents/[id]/balance/route.ts
export const GET = agentAuthMiddleware(async (req, { agent }) => {
  const balance = await payment.getAgentBalance(agent.id);

  return Response.json({ balance });
});
```

---

## 测试

```typescript
import { AgentPaymentService, InMemoryPaymentAdapter, MockSolanaConnection } from '@awa/payment/testing';

describe('AgentPaymentService', () => {
  let payment: AgentPaymentService;
  let mockConnection: MockSolanaConnection;

  beforeEach(() => {
    mockConnection = new MockSolanaConnection();
    payment = new AgentPaymentService({
      adapter: new InMemoryPaymentAdapter(),
      solanaConnection: mockConnection,
      treasuryWallet: 'treasury-wallet-address',
      walletEncryptionKey: 'test-key',
    });
  });

  it('purchases skill automatically', async () => {
    // Mock Agent 有足够余额
    mockConnection.mockBalance('agent-wallet', 10);

    const result = await payment.purchaseSkill('agent-1', 'skill-1');

    expect(result.success).toBe(true);
    expect(result.transactionSignature).toBeDefined();
    expect(result.skillContent).toBeDefined();
  });

  it('fails with insufficient balance', async () => {
    // Mock Agent 余额不足
    mockConnection.mockBalance('agent-wallet', 0.001);

    const result = await payment.purchaseSkill('agent-1', 'skill-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Insufficient balance');
  });
});
```
