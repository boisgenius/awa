# AWA 模块化架构设计

> Next.js 全栈 + 模块化目录结构，适配 Claude Code 开发
>
> **注意**: 业务逻辑模块位于 `src/lib/` 目录下，不再使用独立的 packages/ 结构

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
│  │  (Next.js)   │  │   (PWA)      │  │     (agent-sdk)                │ │
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
│  │                      Core Modules (src/lib/*)                       │ │
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

## 模块清单

| 模块 | 路径 | 职责 | 优先级 | 文档 |
|------|------|------|--------|------|
| auth | `src/lib/auth/` | Agent API Key 认证 | P0 | [auth.md](./packages/auth.md) |
| skills | `src/lib/skills/` | 技能 CRUD + 版本管理 | P0 | [skills.md](./packages/skills.md) |
| ranking | `src/lib/ranking/` | 技能排序算法 | P1 | [ranking.md](./packages/ranking.md) |
| rating | `src/lib/rating/` | 评分系统 | P1 | [rating.md](./packages/rating.md) |
| payment | `src/lib/payment/` | Agent 自动支付 | P0 | [payment.md](./packages/payment.md) |
| rate-limiter | `src/lib/rate-limiter/` | API 限流 | P1 | [rate-limiter.md](./packages/rate-limiter.md) |
| agent-sdk | `src/lib/agent-sdk/` | Agent 开发 SDK | P0 | [agent-sdk.md](./packages/agent-sdk.md) |

---

## 项目结构

```
awa/                             # 当前仓库
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API Routes
│   │   ├── (marketing)/         # 营销页面
│   │   └── (dashboard)/         # 仪表板页面
│   │
│   ├── components/              # UI 组件
│   │   ├── ui/
│   │   ├── layout/
│   │   └── features/
│   │
│   ├── lib/                     # 核心业务逻辑模块
│   │   ├── auth/                # Agent API Key 认证
│   │   │   ├── index.ts
│   │   │   ├── agent-auth.ts
│   │   │   ├── middleware.ts
│   │   │   └── types.ts
│   │   ├── skills/              # 技能管理
│   │   ├── ranking/             # 排序算法
│   │   ├── rating/              # 评分系统
│   │   ├── payment/             # Agent 自动支付
│   │   ├── rate-limiter/        # API 限流
│   │   ├── agent-sdk/           # Agent SDK
│   │   ├── supabase/            # 数据库客户端
│   │   └── solana/              # Solana 客户端
│   │
│   ├── hooks/                   # 自定义 Hooks
│   ├── stores/                  # Zustand 状态
│   └── types/                   # 全局类型
│
├── docs/                        # 文档
└── package.json                 # 项目配置
```

---

## 工具

| 工具 | 说明 |
|------|------|
| **pnpm** | 包管理器 |
| **Vitest** | 单元测试框架 |
| **Playwright** | E2E 测试框架 |

---

## 模块依赖关系

```
lib/agent-sdk
    └── lib/auth (API Key 验证)

lib/skills
    ├── lib/rating (评分数据)
    └── lib/ranking (排序)

lib/payment
    ├── lib/auth (Agent 验证)
    └── lib/skills (购买技能)

app/api/*
    ├── lib/auth
    ├── lib/skills
    ├── lib/ranking
    ├── lib/rating
    ├── lib/payment
    └── lib/rate-limiter
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
import { authMiddleware } from '@/lib/auth';
import { rateLimitMiddleware } from '@/lib/rate-limiter';

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

### 本地开发

```bash
# 安装 pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 开发
pnpm dev

# 测试 (TDD Watch 模式)
pnpm test:watch

# 测试 (单次运行)
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

1. [ ] 初始化 Next.js 项目
2. [ ] 配置 TDD 测试环境
3. [ ] 实现 `src/lib/auth/`
4. [ ] 实现 `src/lib/skills/`
5. [ ] 实现 `src/lib/payment/`
6. [ ] 实现 `src/lib/agent-sdk/`
7. [ ] 实现 API Routes 和页面
