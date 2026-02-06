# @awa/rate-limiter

> API 限流器 - 滑动窗口算法、多存储后端

## 安装

```bash
npm install @awa/rate-limiter
# or
pnpm add @awa/rate-limiter
```

## 功能特性

- **滑动窗口** - 精确的请求计数
- **多策略** - 不同 API 不同限制
- **多存储** - 内存 / Redis
- **中间件** - Express / Next.js
- **响应头** - 标准 X-RateLimit-* 头

---

## 快速开始

```typescript
import { RateLimiter, MemoryStore } from '@awa/rate-limiter';

const limiter = new RateLimiter({
  store: new MemoryStore(),
  defaultLimit: {
    max: 100,
    window: 60 * 1000, // 1 分钟
  },
});

// 检查是否允许
const allowed = await limiter.check('user-123', 'default');

// 消费配额
const result = await limiter.consume('user-123', 'default');
// { allowed: true, remaining: 99, resetAt: 1234567890 }

// 获取状态
const status = await limiter.getStatus('user-123', 'default');
// { used: 1, remaining: 99, resetAt: 1234567890 }
```

---

## 多策略配置

```typescript
const limiter = new RateLimiter({
  store: new MemoryStore(),
  defaultLimit: { max: 100, window: 60000 },
  limits: {
    // 认证 API - 更严格
    auth: { max: 10, window: 60000 },

    // Agent API - 更宽松
    agent: { max: 200, window: 60000 },

    // 发帖 - 每 30 分钟 1 次
    post: { max: 1, window: 30 * 60000 },

    // 评分 - 每小时 10 次
    rate: { max: 10, window: 60 * 60000 },
  },
});

// 使用不同策略
await limiter.consume('user-123', 'auth');   // 认证限制
await limiter.consume('agent-456', 'agent'); // Agent 限制
await limiter.consume('user-123', 'post');   // 发帖限制
```

---

## 存储后端

### 内存存储（单实例）

```typescript
import { RateLimiter, MemoryStore } from '@awa/rate-limiter';

const limiter = new RateLimiter({
  store: new MemoryStore(),
  // ...
});
```

### Redis 存储（分布式）

```typescript
import { RateLimiter, RedisStore } from '@awa/rate-limiter';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const limiter = new RateLimiter({
  store: new RedisStore(redis, {
    prefix: 'claw:ratelimit:',
  }),
  // ...
});
```

---

## 中间件

### Next.js App Router

```typescript
// middleware.ts
import { rateLimitMiddleware } from '@awa/rate-limiter/next';

export default rateLimitMiddleware({
  store: new MemoryStore(),
  defaultLimit: { max: 100, window: 60000 },
  // 自定义 key 生成
  keyGenerator: (req) => {
    return req.headers.get('x-forwarded-for') || 'anonymous';
  },
  // 跳过某些路径
  skip: (req) => {
    return req.nextUrl.pathname === '/api/health';
  },
});

// 或在单个 route 使用
// app/api/auth/login/route.ts
import { withRateLimit } from '@awa/rate-limiter/next';

export const POST = withRateLimit(
  async (req) => {
    // 处理登录
  },
  { limit: 'auth' } // 使用 auth 限制策略
);
```

### Express

```typescript
import express from 'express';
import { expressRateLimiter } from '@awa/rate-limiter';

const app = express();

// 全局限制
app.use(expressRateLimiter({
  store: new MemoryStore(),
  defaultLimit: { max: 100, window: 60000 },
}));

// 特定路由更严格限制
app.use('/api/auth', expressRateLimiter({
  store: new MemoryStore(),
  defaultLimit: { max: 10, window: 60000 },
}));
```

---

## API 参考

### RateLimiter

```typescript
class RateLimiter {
  constructor(options: RateLimiterOptions);

  // 核心方法
  check(key: string, limitName?: string): Promise<boolean>;
  consume(key: string, limitName?: string, cost?: number): Promise<ConsumeResult>;
  getStatus(key: string, limitName?: string): Promise<RateLimitStatus>;

  // 管理
  reset(key: string, limitName?: string): Promise<void>;
  block(key: string, duration: number): Promise<void>;
  unblock(key: string): Promise<void>;
}
```

### 类型定义

```typescript
interface RateLimiterOptions {
  store: RateLimitStore;
  defaultLimit: LimitConfig;
  limits?: Record<string, LimitConfig>;
  keyPrefix?: string;
}

interface LimitConfig {
  max: number;           // 最大请求数
  window: number;        // 时间窗口（毫秒）
}

interface ConsumeResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;       // Unix timestamp
  retryAfter?: number;   // 秒（如果被限制）
}

interface RateLimitStatus {
  used: number;
  remaining: number;
  resetAt: number;
  blocked: boolean;
}
```

### Store 接口

```typescript
interface RateLimitStore {
  // 获取当前窗口计数
  get(key: string): Promise<{ count: number; resetAt: number } | null>;

  // 增加计数
  increment(key: string, window: number): Promise<{ count: number; resetAt: number }>;

  // 重置
  reset(key: string): Promise<void>;

  // 阻止（可选）
  block?(key: string, until: number): Promise<void>;
  unblock?(key: string): Promise<void>;
  isBlocked?(key: string): Promise<boolean>;
}
```

---

## 响应头

限流信息通过标准 HTTP 头返回：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1234567890
Retry-After: 30  (仅在被限制时)
```

```typescript
// 中间件自动添加响应头
// 或手动添加
const result = await limiter.consume(key);

res.setHeader('X-RateLimit-Limit', limit.max);
res.setHeader('X-RateLimit-Remaining', result.remaining);
res.setHeader('X-RateLimit-Reset', result.resetAt);

if (!result.allowed) {
  res.setHeader('Retry-After', result.retryAfter);
  res.status(429).json({ error: 'Too Many Requests' });
}
```

---

## 高级用法

### 自定义 Key 生成

```typescript
const limiter = new RateLimiter({
  store,
  defaultLimit: { max: 100, window: 60000 },
});

// 按用户限制
await limiter.consume(`user:${userId}`);

// 按 IP 限制
await limiter.consume(`ip:${ipAddress}`);

// 按用户+操作限制
await limiter.consume(`user:${userId}:post`);

// 按 Agent 限制
await limiter.consume(`agent:${agentId}`, 'agent');
```

### 动态限制

```typescript
// VIP 用户更高限制
const limit = user.isVip
  ? { max: 1000, window: 60000 }
  : { max: 100, window: 60000 };

const customLimiter = new RateLimiter({
  store,
  defaultLimit: limit,
});
```

### 临时阻止

```typescript
// 检测到异常行为，临时阻止
if (suspiciousActivity) {
  await limiter.block(key, 60 * 60 * 1000); // 阻止 1 小时
}

// 解除阻止
await limiter.unblock(key);
```

---

## 测试

```typescript
import { RateLimiter, MemoryStore } from '@awa/rate-limiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter({
      store: new MemoryStore(),
      defaultLimit: { max: 3, window: 1000 },
    });
  });

  it('allows requests within limit', async () => {
    const r1 = await limiter.consume('test');
    const r2 = await limiter.consume('test');
    const r3 = await limiter.consume('test');

    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests over limit', async () => {
    await limiter.consume('test');
    await limiter.consume('test');
    await limiter.consume('test');

    const r4 = await limiter.consume('test');
    expect(r4.allowed).toBe(false);
    expect(r4.retryAfter).toBeGreaterThan(0);
  });

  it('resets after window', async () => {
    await limiter.consume('test');
    await limiter.consume('test');
    await limiter.consume('test');

    // 等待窗口过期
    await new Promise(r => setTimeout(r, 1100));

    const result = await limiter.consume('test');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('uses different limits for different strategies', async () => {
    const limiter = new RateLimiter({
      store: new MemoryStore(),
      defaultLimit: { max: 10, window: 1000 },
      limits: {
        strict: { max: 2, window: 1000 },
      },
    });

    await limiter.consume('test', 'strict');
    await limiter.consume('test', 'strict');

    const result = await limiter.consume('test', 'strict');
    expect(result.allowed).toBe(false);

    // default 策略仍然允许
    const defaultResult = await limiter.consume('test', 'default');
    expect(defaultResult.allowed).toBe(true);
  });
});
```

---

## 最佳实践

1. **生产环境使用 Redis** - 支持分布式部署
2. **合理设置限制** - 根据 API 重要性区分
3. **监控限流事件** - 记录被限流的请求
4. **友好的错误信息** - 告知用户何时可以重试
5. **白名单机制** - 某些服务账号可跳过限流
