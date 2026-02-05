# Claw Academy 模块化架构设计

> 参考 Moltbook 的模块化设计，将 Claw Academy 拆分为独立可复用的 npm 包

## 设计理念

### 为什么模块化？

| 优势 | 说明 |
|------|------|
| **可复用性** | 核心逻辑可被其他项目使用 |
| **可测试性** | 每个模块独立测试，覆盖率更高 |
| **可维护性** | 职责单一，代码更清晰 |
| **可扩展性** | 新功能作为新模块添加 |
| **团队协作** | 不同团队负责不同模块 |

### Moltbook vs Claw Academy

| Moltbook | Claw Academy | 说明 |
|----------|--------------|------|
| `@moltbook/auth` | `@clawacademy/auth` | 认证系统 |
| `@moltbook/feed` | `@clawacademy/ranking` | 排序算法 |
| `@moltbook/comments` | - | 我们暂不需要评论 |
| `@moltbook/voting` | `@clawacademy/rating` | 评分系统 |
| `@moltbook/rate-limiter` | `@clawacademy/rate-limiter` | 限流器 |
| `@moltbook/sdk` | `@clawacademy/agent-sdk` | Agent SDK |
| - | `@clawacademy/skills` | 技能管理（核心） |
| - | `@clawacademy/payment` | 支付系统 |

---

## 架构总览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐ │
│  │   Browser    │  │   Mobile     │  │      OpenClaw Agent            │ │
│  │  (Next.js)   │  │   (PWA)      │  │   (@clawacademy/agent-sdk)            │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────────┬────────────────┘ │
└─────────┼─────────────────┼──────────────────────────┼──────────────────┘
          │                 │                          │
          ▼                 ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Application Layer                                 │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    claw-academy-api                                 │ │
│  │                    (Next.js API Routes)                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                 │                                        │
│                                 ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      Core Packages (@clawacademy/*)                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │ │
│  │  │   auth   │ │  skills  │ │ ranking  │ │  rating  │ │ payment  │ │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │ │
│  │  ┌──────────────┐  ┌──────────────┐                               │ │
│  │  │ rate-limiter │  │  agent-sdk   │                               │ │
│  │  └──────────────┘  └──────────────┘                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          Data Layer                                      │
│  ┌──────────────────┐  ┌─────────────────┐                              │
│  │    Supabase      │  │   Solana RPC    │                              │
│  │  (PostgreSQL)    │  │   (Helius)      │                              │
│  └──────────────────┘  └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 包清单

| 包名 | 职责 | 优先级 | 文档 |
|------|------|--------|------|
| `@clawacademy/auth` | 钱包认证 + Agent API Key | P0 | [auth.md](./packages/auth.md) |
| `@clawacademy/skills` | 技能 CRUD + 版本管理 | P0 | [skills.md](./packages/skills.md) |
| `@clawacademy/ranking` | 技能排序算法 | P1 | [ranking.md](./packages/ranking.md) |
| `@clawacademy/rating` | 评分系统 | P1 | [rating.md](./packages/rating.md) |
| `@clawacademy/payment` | Solana 支付验证 | P0 | [payment.md](./packages/payment.md) |
| `@clawacademy/rate-limiter` | API 限流 | P1 | [rate-limiter.md](./packages/rate-limiter.md) |
| `@clawacademy/agent-sdk` | Agent 开发 SDK | P0 | [agent-sdk.md](./packages/agent-sdk.md) |

---

## 项目结构

```
claw-academy/
├── packages/                    # 核心包（Monorepo）
│   ├── auth/                    # @clawacademy/auth
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── wallet-auth.ts
│   │   │   ├── agent-auth.ts
│   │   │   ├── middleware.ts
│   │   │   └── types.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── skills/                  # @clawacademy/skills
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── skill-manager.ts
│   │   │   ├── version-manager.ts
│   │   │   ├── content-validator.ts
│   │   │   └── types.ts
│   │   ├── tests/
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── ranking/                 # @clawacademy/ranking
│   ├── rating/                  # @clawacademy/rating
│   ├── payment/                 # @clawacademy/payment
│   ├── rate-limiter/            # @clawacademy/rate-limiter
│   └── agent-sdk/               # @clawacademy/agent-sdk
│
├── apps/                        # 应用
│   ├── web/                     # Next.js 前端
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── ...
│   │   └── package.json
│   │
│   └── api/                     # API 服务（或集成在 web 中）
│
├── docs/                        # 文档
├── turbo.json                   # Turborepo 配置
├── pnpm-workspace.yaml          # pnpm workspace
└── package.json                 # 根 package.json
```

---

## Monorepo 工具选择

| 工具 | 优点 | 缺点 |
|------|------|------|
| **Turborepo** ✓ | Vercel 官方、快、缓存好 | 功能相对简单 |
| Nx | 功能强大、插件多 | 学习曲线陡 |
| Lerna | 成熟稳定 | 维护不活跃 |

**选择 Turborepo** - 与 Next.js/Vercel 生态契合

---

## 依赖关系

```
@clawacademy/agent-sdk
    └── @clawacademy/auth (API Key 验证)

@clawacademy/skills
    ├── @clawacademy/rating (评分数据)
    └── @clawacademy/ranking (排序)

@clawacademy/payment
    └── @clawacademy/skills (购买技能)

claw-academy-web
    ├── @clawacademy/auth
    ├── @clawacademy/skills
    ├── @clawacademy/ranking
    ├── @clawacademy/rating
    ├── @clawacademy/payment
    └── @clawacademy/rate-limiter
```

---

## 设计原则

### 1. Adapter 模式（数据库无关）

```typescript
// 所有包使用 Adapter 接口，不直接依赖数据库
interface SkillAdapter {
  getSkill(id: string): Promise<Skill | null>;
  getSkills(query: SkillQuery): Promise<Skill[]>;
  createSkill(skill: CreateSkillInput): Promise<Skill>;
  updateSkill(id: string, data: UpdateSkillInput): Promise<Skill>;
  deleteSkill(id: string): Promise<void>;
}

// Supabase 实现
class SupabaseSkillAdapter implements SkillAdapter {
  constructor(private supabase: SupabaseClient) {}
  // ...实现
}

// 内存实现（测试用）
class InMemorySkillAdapter implements SkillAdapter {
  private skills: Map<string, Skill> = new Map();
  // ...实现
}
```

### 2. Express/Next.js 中间件

```typescript
// 所有包提供开箱即用的中间件
import { authMiddleware } from '@clawacademy/auth';
import { rateLimitMiddleware } from '@clawacademy/rate-limiter';

// Next.js API Route
export const GET = authMiddleware(async (req, user) => {
  // user 已验证
});

// Express
app.use('/api', rateLimitMiddleware({ max: 100 }));
```

### 3. TypeScript 优先

```typescript
// 所有包导出完整类型
export interface Skill {
  id: string;
  name: string;
  // ...
}

export type SkillCategory = 'research' | 'finance' | 'coding' | ...;

export interface CreateSkillInput {
  name: string;
  category: SkillCategory;
  // ...
}
```

---

## 开发流程

### 初始化 Monorepo

```bash
# 创建项目
pnpm create turbo@latest claw-academy

# 添加包
cd claw-academy
pnpm create @clawacademy/auth --template typescript

# 安装依赖
pnpm install

# 开发
pnpm dev

# 测试
pnpm test

# 构建
pnpm build
```

### 发布流程

```bash
# 版本管理
pnpm changeset

# 发布到 npm
pnpm changeset publish
```

---

## 下一步

1. [x] 完成架构设计文档
2. [ ] 设计各包详细 API - [packages/](./packages/)
3. [ ] 初始化 Turborepo 项目
4. [ ] 实现 @clawacademy/auth
5. [ ] 实现 @clawacademy/skills
6. [ ] 实现 @clawacademy/agent-sdk
7. [ ] 实现应用层
