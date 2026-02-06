# AWA 模块化架构设计

> 单仓库 + 模块化目录结构，适配 Claude Code 开发

## 设计理念

### 为什么模块化？

| 优势 | 说明 |
|------|------|
| **可复用性** | 核心逻辑可被其他项目使用 |
| **可测试性** | 每个模块独立测试，覆盖率更高 |
| **可维护性** | 职责单一，代码更清晰 |
| **可扩展性** | 新功能作为新模块添加 |
| **Claude Code 友好** | 每次对话专注单个模块 |

---

## 架构总览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────────────┐ │
│  │   Browser    │  │   Mobile     │  │      OpenClaw Agent            │ │
│  │  (Next.js)   │  │   (PWA)      │  │     (@awa/agent-sdk)           │ │
│  └──────┬───────┘  └──────┬───────┘  └───────────────┬────────────────┘ │
└─────────┼─────────────────┼──────────────────────────┼──────────────────┘
          │                 │                          │
          ▼                 ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Application Layer                                 │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                       awa-web                                       │ │
│  │                    (Next.js API Routes)                             │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                 │                                        │
│                                 ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                      Core Packages (@awa/*)                         │ │
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

## 认证与支付架构

### Agent 认证（无需用户钱包登录）

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  OpenClaw Agent │────▶│   AWA API       │────▶│    Supabase     │
│                 │     │                 │     │                 │
│  - API Key      │     │  - 验证 Key     │     │  - Agent 数据   │
│  - 绑定钱包     │     │  - 返回 Agent   │     │  - 钱包密钥     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Agent 自动支付

```
1. Agent 请求购买技能
2. 验证 Agent API Key
3. 获取 Agent 绑定的钱包密钥
4. 服务端自动构建并签名交易
5. 提交到 Solana 网络
6. 验证交易成功
7. 返回技能内容
```

---

## 包清单

| 包名 | 职责 | 优先级 | 文档 |
|------|------|--------|------|
| `@awa/auth` | Agent API Key 认证 | P0 | [auth.md](./packages/auth.md) |
| `@awa/skills` | 技能 CRUD + 版本管理 | P0 | [skills.md](./packages/skills.md) |
| `@awa/ranking` | 技能排序算法 | P1 | [ranking.md](./packages/ranking.md) |
| `@awa/rating` | 评分系统 | P1 | [rating.md](./packages/rating.md) |
| `@awa/payment` | Agent 自动支付 | P0 | [payment.md](./packages/payment.md) |
| `@awa/rate-limiter` | API 限流 | P1 | [rate-limiter.md](./packages/rate-limiter.md) |
| `@awa/agent-sdk` | Agent 开发 SDK | P0 | [agent-sdk.md](./packages/agent-sdk.md) |

---

## 项目结构

```
awa/                             # 当前仓库
├── apps/
│   └── web/                     # Next.js 前端
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   └── ...
│       └── package.json
│
├── packages/                    # 核心包（Monorepo）
│   ├── auth/                    # @awa/auth
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── agent-auth.ts    # Agent API Key 认证
│   │   │   ├── middleware.ts
│   │   │   └── types.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── skills/                  # @awa/skills
│   ├── ranking/                 # @awa/ranking
│   ├── rating/                  # @awa/rating
│   ├── payment/                 # @awa/payment (Agent 自动支付)
│   ├── rate-limiter/            # @awa/rate-limiter
│   └── agent-sdk/               # @awa/agent-sdk
│
├── docs/                        # 文档
├── turbo.json                   # Turborepo 配置
├── pnpm-workspace.yaml          # pnpm workspace
└── package.json                 # 根 package.json
```

---

## Monorepo 工具

| 工具 | 说明 |
|------|------|
| **Turborepo** | 构建系统，缓存优化 |
| **pnpm** | 包管理，节省磁盘空间 |

---

## 依赖关系

```
@awa/agent-sdk
    └── @awa/auth (API Key 验证)

@awa/skills
    ├── @awa/rating (评分数据)
    └── @awa/ranking (排序)

@awa/payment
    ├── @awa/auth (Agent 验证)
    └── @awa/skills (购买技能)

awa-web
    ├── @awa/auth
    ├── @awa/skills
    ├── @awa/ranking
    ├── @awa/rating
    ├── @awa/payment
    └── @awa/rate-limiter
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
}

// Supabase 实现
class SupabaseSkillAdapter implements SkillAdapter { }

// 内存实现（测试用）
class InMemorySkillAdapter implements SkillAdapter { }
```

### 2. Next.js 中间件

```typescript
import { authMiddleware } from '@awa/auth';
import { rateLimitMiddleware } from '@awa/rate-limiter';

// Next.js API Route
export const GET = authMiddleware(async (req, { agent }) => {
  // agent 已验证
});
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
```

---

## 开发流程

### 初始化 Monorepo

```bash
# 安装 pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 开发
pnpm dev

# 测试
pnpm test

# 构建
pnpm build
```

---

## CI/CD

> GitHub Actions 负责测试，Vercel 自动部署

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test

# Vercel 自动部署（连接 GitHub 仓库后自动触发）
```

---

## 下一步

1. [ ] 初始化 Turborepo 项目
2. [ ] 实现 @awa/auth
3. [ ] 实现 @awa/skills
4. [ ] 实现 @awa/payment
5. [ ] 实现 @awa/agent-sdk
6. [ ] 实现应用层
