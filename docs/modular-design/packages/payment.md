# @clawacademy/payment

> Solana 支付验证 - 购买技能、验证交易

## 安装

```bash
npm install @clawacademy/payment
# or
pnpm add @clawacademy/payment
```

## 功能特性

- **交易验证** - 验证 Solana 链上交易
- **购买记录** - 记录和查询购买历史
- **多币种** - SOL / USDC / $CLAW
- **退款支持** - 管理员退款功能
- **Webhook** - 交易状态回调

---

## 快速开始

```typescript
import { PaymentSystem, SupabasePaymentAdapter } from '@clawacademy/payment';
import { Connection } from '@solana/web3.js';

const connection = new Connection(process.env.SOLANA_RPC_URL);
const payment = new PaymentSystem({
  adapter: new SupabasePaymentAdapter(supabase),
  solanaConnection: connection,
  treasuryWallet: process.env.TREASURY_WALLET,
});

// 创建购买订单
const order = await payment.createOrder({
  userId: 'user-uuid',
  skillId: 'skill-uuid',
  price: 2.5,
  currency: 'SOL',
});

// 返回给前端
// { orderId, price, currency, treasuryWallet, expiresAt }

// 用户支付后，验证交易
const purchase = await payment.verifyAndComplete({
  orderId: order.id,
  txSignature: 'tx-signature-from-wallet',
});

// 检查是否已购买
const hasPurchased = await payment.hasPurchased('user-uuid', 'skill-uuid');
```

---

## 购买流程

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│  前端   │      │   API   │      │ Payment │      │ Solana  │
└────┬────┘      └────┬────┘      └────┬────┘      └────┬────┘
     │                │                │                │
     │ 1. 点击购买    │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ 2. createOrder │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │ 3. order info  │                │
     │                │<───────────────│                │
     │                │                │                │
     │ 4. order info  │                │                │
     │<───────────────│                │                │
     │                │                │                │
     │ 5. 钱包签名发送交易 ────────────────────────────>│
     │                │                │                │
     │ 6. txSignature │                │                │
     │<──────────────────────────────────────────────────│
     │                │                │                │
     │ 7. 提交验证    │                │                │
     │───────────────>│                │                │
     │                │                │                │
     │                │ 8. verify      │                │
     │                │───────────────>│                │
     │                │                │                │
     │                │                │ 9. 查询交易    │
     │                │                │───────────────>│
     │                │                │                │
     │                │                │ 10. 交易详情   │
     │                │                │<───────────────│
     │                │                │                │
     │                │ 11. purchase   │                │
     │                │<───────────────│                │
     │                │                │                │
     │ 12. 购买成功   │                │                │
     │<───────────────│                │                │
```

---

## API 参考

### PaymentSystem

```typescript
class PaymentSystem {
  constructor(options: PaymentSystemOptions);

  // 订单
  createOrder(params: CreateOrderParams): Promise<Order>;
  getOrder(orderId: string): Promise<Order | null>;
  cancelOrder(orderId: string): Promise<void>;

  // 验证和完成
  verifyAndComplete(params: VerifyParams): Promise<Purchase>;
  verifyTransaction(txSignature: string): Promise<TransactionInfo>;

  // 查询
  hasPurchased(userId: string, skillId: string): Promise<boolean>;
  getPurchase(userId: string, skillId: string): Promise<Purchase | null>;
  getUserPurchases(userId: string, options?: ListOptions): Promise<PurchaseListResult>;
  getSkillPurchases(skillId: string, options?: ListOptions): Promise<PurchaseListResult>;

  // 统计
  getSkillRevenue(skillId: string): Promise<RevenueStats>;
  getAuthorRevenue(authorId: string): Promise<RevenueStats>;

  // 退款（管理员）
  refund(purchaseId: string, reason: string): Promise<Refund>;
}
```

### PaymentAdapter 接口

```typescript
interface PaymentAdapter {
  // 订单
  createOrder(input: CreateOrderInput): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  updateOrder(id: string, input: UpdateOrderInput): Promise<Order>;

  // 购买
  createPurchase(input: CreatePurchaseInput): Promise<Purchase>;
  getPurchase(userId: string, skillId: string): Promise<Purchase | null>;
  getPurchasesByUser(userId: string, options?: ListOptions): Promise<{ purchases: Purchase[]; total: number }>;
  getPurchasesBySkill(skillId: string, options?: ListOptions): Promise<{ purchases: Purchase[]; total: number }>;

  // 退款
  createRefund(input: CreateRefundInput): Promise<Refund>;
}
```

---

## 类型定义

```typescript
type Currency = 'SOL' | 'USDC' | 'CLAW';
type OrderStatus = 'pending' | 'completed' | 'expired' | 'cancelled';
type PurchaseStatus = 'confirmed' | 'refunded';

interface Order {
  id: string;
  userId: string;
  skillId: string;
  price: number;
  currency: Currency;
  status: OrderStatus;
  treasuryWallet: string;
  expiresAt: Date;
  createdAt: Date;
}

interface Purchase {
  id: string;
  orderId: string;
  userId: string;
  skillId: string;
  price: number;
  currency: Currency;
  txSignature: string;
  status: PurchaseStatus;
  createdAt: Date;
}

interface CreateOrderParams {
  userId: string;
  skillId: string;
  price: number;
  currency: Currency;
}

interface VerifyParams {
  orderId: string;
  txSignature: string;
}

interface TransactionInfo {
  signature: string;
  confirmed: boolean;
  amount: number;
  from: string;
  to: string;
  timestamp: Date;
}

interface RevenueStats {
  total: number;
  currency: Currency;
  count: number;
  lastPurchase?: Date;
}

interface PaymentSystemOptions {
  adapter: PaymentAdapter;
  solanaConnection: Connection;
  treasuryWallet: string;
  orderExpiration?: number;  // 默认 30 分钟
  confirmations?: number;    // 默认 1
}
```

---

## 交易验证

```typescript
// 验证交易详情
const txInfo = await payment.verifyTransaction(txSignature);

// 检查项
// 1. 交易已确认
// 2. 金额正确
// 3. 收款地址正确（treasury wallet）
// 4. 交易时间在有效期内

if (!txInfo.confirmed) {
  throw new Error('Transaction not confirmed');
}

if (txInfo.amount < order.price) {
  throw new Error('Insufficient payment');
}

if (txInfo.to !== treasuryWallet) {
  throw new Error('Invalid recipient');
}
```

---

## 多币种支持

```typescript
// SOL 支付
const order = await payment.createOrder({
  userId,
  skillId,
  price: 2.5,
  currency: 'SOL',
});

// USDC 支付
const order = await payment.createOrder({
  userId,
  skillId,
  price: 50,
  currency: 'USDC',
});

// $CLAW 支付（享受折扣）
const order = await payment.createOrder({
  userId,
  skillId,
  price: 100,
  currency: 'CLAW',
});
```

---

## Webhook 集成

```typescript
const payment = new PaymentSystem({
  adapter,
  solanaConnection,
  treasuryWallet,
  webhooks: {
    onPurchaseComplete: async (purchase) => {
      // 通知用户
      await notifyUser(purchase.userId, 'Purchase complete!');

      // 更新技能下载量
      await skills.incrementDownloads(purchase.skillId);

      // 授权 Agent 访问
      await grantAgentAccess(purchase.userId, purchase.skillId);
    },
    onRefund: async (refund) => {
      // 撤销访问权限
      await revokeAgentAccess(refund.userId, refund.skillId);
    },
  },
});
```

---

## API 示例

### 创建订单

```typescript
// app/api/skills/[id]/purchase/route.ts
export const POST = authMiddleware(async (req, { user }) => {
  const skillId = req.params.id;

  // 检查是否已购买
  if (await payment.hasPurchased(user.id, skillId)) {
    return Response.json(
      { error: 'Already purchased' },
      { status: 400 }
    );
  }

  // 获取技能价格
  const skill = await skills.getById(skillId);

  // 创建订单
  const order = await payment.createOrder({
    userId: user.id,
    skillId,
    price: skill.price,
    currency: skill.currency,
  });

  return Response.json(order);
});
```

### 验证支付

```typescript
// app/api/orders/[id]/verify/route.ts
export const POST = authMiddleware(async (req, { user }) => {
  const orderId = req.params.id;
  const { txSignature } = await req.json();

  // 验证订单属于当前用户
  const order = await payment.getOrder(orderId);
  if (order.userId !== user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // 验证并完成购买
  const purchase = await payment.verifyAndComplete({
    orderId,
    txSignature,
  });

  return Response.json(purchase);
});
```

---

## 测试

```typescript
import { PaymentSystem, InMemoryPaymentAdapter, MockSolanaConnection } from '@clawacademy/payment/testing';

describe('PaymentSystem', () => {
  let payment: PaymentSystem;
  let mockConnection: MockSolanaConnection;

  beforeEach(() => {
    mockConnection = new MockSolanaConnection();
    payment = new PaymentSystem({
      adapter: new InMemoryPaymentAdapter(),
      solanaConnection: mockConnection,
      treasuryWallet: 'treasury-wallet-address',
    });
  });

  it('creates order', async () => {
    const order = await payment.createOrder({
      userId: 'user-1',
      skillId: 'skill-1',
      price: 2.5,
      currency: 'SOL',
    });

    expect(order.status).toBe('pending');
    expect(order.price).toBe(2.5);
  });

  it('verifies and completes purchase', async () => {
    const order = await payment.createOrder({
      userId: 'user-1',
      skillId: 'skill-1',
      price: 2.5,
      currency: 'SOL',
    });

    // Mock 交易
    mockConnection.mockTransaction('tx-123', {
      confirmed: true,
      amount: 2.5,
      to: 'treasury-wallet-address',
    });

    const purchase = await payment.verifyAndComplete({
      orderId: order.id,
      txSignature: 'tx-123',
    });

    expect(purchase.status).toBe('confirmed');
  });

  it('rejects invalid transaction', async () => {
    const order = await payment.createOrder({
      userId: 'user-1',
      skillId: 'skill-1',
      price: 2.5,
      currency: 'SOL',
    });

    // Mock 金额不足的交易
    mockConnection.mockTransaction('tx-123', {
      confirmed: true,
      amount: 1.0, // 不足
      to: 'treasury-wallet-address',
    });

    await expect(payment.verifyAndComplete({
      orderId: order.id,
      txSignature: 'tx-123',
    })).rejects.toThrow('Insufficient payment');
  });
});
```
