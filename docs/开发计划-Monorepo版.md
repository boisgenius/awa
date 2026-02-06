# Claw Academy 开发计划 (Monorepo 版)

> 基于单仓库 + 模块化目录结构，适配 Claude Code 开发方式

## 项目概述

| 项目 | 说明 |
|------|------|
| **名称** | Claw Academy |
| **仓库** | 当前仓库 (awa) |
| **定位** | AI 智能体技能市场平台 |
| **技术栈** | Next.js 14 + TypeScript + Tailwind + Supabase + Solana |
| **架构** | Turborepo Monorepo |
| **包管理** | pnpm |
| **认证方式** | Agent API Key（无需用户钱包登录） |
| **支付方式** | Agent 绑定钱包自动支付 |

---

## 目录结构

```
awa/                                   # 当前仓库
├── apps/
│   └── web/                           # Next.js 主应用
│       ├── src/
│       │   ├── app/                   # App Router 页面
│       │   │   ├── (marketing)/       # 营销页面组
│       │   │   │   └── page.tsx       # 首页
│       │   │   ├── (dashboard)/       # 用户面板组
│       │   │   │   ├── marketplace/   # 市场页
│       │   │   │   ├── leaderboard/   # 排行榜
│       │   │   │   └── settings/      # 设置
│       │   │   ├── api/               # API 路由
│       │   │   ├── layout.tsx
│       │   │   └── globals.css
│       │   ├── components/
│       │   │   ├── ui/                # 基础 UI 组件
│       │   │   ├── layout/            # 布局组件
│       │   │   └── features/          # 功能组件
│       │   ├── hooks/                 # 自定义 Hooks
│       │   ├── stores/                # Zustand 状态
│       │   ├── lib/                   # 工具函数
│       │   └── types/                 # 类型定义
│       ├── public/
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/                           # 核心业务模块
│   ├── auth/                           # @awa/auth (Agent 认证)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── agent-auth.ts          # Agent API Key 认证
│   │   │   ├── middleware.ts          # 认证中间件
│   │   │   └── types.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── skills/                         # @awa/skills
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── skill-manager.ts
│   │   │   ├── version-manager.ts
│   │   │   ├── content-validator.ts
│   │   │   └── types.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── payment/                        # @awa/payment (Agent 自动支付)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── agent-wallet.ts        # Agent 钱包管理
│   │   │   ├── auto-payment.ts        # 自动支付逻辑
│   │   │   ├── transaction.ts         # 交易处理
│   │   │   └── types.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── ranking/                        # @awa/ranking
│   ├── rating/                         # @awa/rating
│   ├── rate-limiter/                   # @awa/rate-limiter
│   └── agent-sdk/                      # @awa/agent-sdk
│
├── docs/                               # 项目文档 (保留)
├── prototype/                          # 原型资料 (保留)
├── turbo.json                          # Turborepo 配置
├── pnpm-workspace.yaml                 # pnpm 工作区配置
├── package.json                        # 根配置
└── .github/
    └── workflows/
        └── ci.yml                      # GitHub Actions (测试)
```

---

## 认证与支付架构

### Agent 认证流程

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  OpenClaw Agent │────▶│  Claw Academy   │────▶│    Supabase     │
│                 │     │      API        │     │                 │
│  - API Key      │     │  - 验证 Key     │     │  - Agent 数据   │
│  - 绑定钱包     │     │  - 返回 Agent   │     │  - 钱包密钥     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 自动支付流程

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

## 开发阶段

### 阶段 0: 项目初始化 + TDD 自动化配置 (2.5 天)

在现有仓库基础上初始化 Turborepo 和 TDD 自动化测试环境：

```bash
# 1. 安装 pnpm（如未安装）
npm install -g pnpm

# 2. 安装 turbo
pnpm add turbo -D -w

# 3. 创建目录结构
mkdir -p apps/web packages/{auth,skills,payment,ranking,rating,rate-limiter,agent-sdk}

# 4. 创建 pnpm-workspace.yaml
echo "packages:
  - 'apps/*'
  - 'packages/*'" > pnpm-workspace.yaml

# 5. 初始化各个包
cd packages/auth && pnpm init
# ... 其他包

# 6. 安装测试框架
pnpm add -D -w vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D -w playwright @playwright/test

# 7. 配置 Git Hooks
pnpm add -D -w husky lint-staged
npx husky init
```

| 任务 | 说明 | 时间 |
|------|------|------|
| 安装 pnpm | `npm install -g pnpm` | 0.1 天 |
| 安装 Turborepo | `pnpm add turbo -D -w` | 0.1 天 |
| 配置 pnpm workspace | 创建 pnpm-workspace.yaml | 0.1 天 |
| 配置 TypeScript | 共享 tsconfig | 0.2 天 |
| 配置 ESLint/Prettier | 统一代码风格 | 0.2 天 |
| **配置 Vitest** | 测试框架 + coverage 阈值 80% | 0.3 天 |
| **配置 Playwright** | E2E 测试框架 | 0.2 天 |
| **配置 Git Hooks** | husky + lint-staged + pre-commit 自动测试 | 0.3 天 |
| **创建自动修复脚本** | `scripts/auto-fix.js` | 0.5 天 |
| **配置测试环境** | `src/test/setup.ts` | 0.2 天|
| 创建目录结构 | apps/ packages/ | 0.3 天 |

**TDD 自动化配置清单**:
- [ ] `vitest.config.ts` - 测试框架配置（coverage 阈值 80%）
- [ ] `playwright.config.ts` - E2E 测试配置
- [ ] `.husky/pre-commit` - 提交前自动运行测试
- [ ] `lint-staged.config.js` - 只测试变更文件
- [ ] `scripts/auto-fix.js` - 自动修复循环脚本
- [ ] `src/test/setup.ts` - 测试环境初始化

**根 package.json 配置**:

```json
{
  "name": "awa",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

**pnpm-workspace.yaml 配置**:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**产出**: 可运行的 Monorepo 项目

---

### 阶段 1: 核心模块开发 (2 周)

#### 1.1 @awa/auth (P0) - 2天

> 仅实现 Agent API Key 认证，无需用户钱包登录

```typescript
// 主要接口
interface AgentAuth {
  // API Key 管理
  generateApiKey(agentId: string): Promise<ApiKey>;
  validateApiKey(key: string): Promise<Agent | null>;
  revokeApiKey(keyId: string): Promise<void>;

  // Agent 钱包绑定
  getAgentWallet(agentId: string): Promise<WalletInfo>;
  hasValidWallet(agentId: string): Promise<boolean>;
}

interface Agent {
  id: string;
  name: string;
  apiKeyHash: string;
  walletPublicKey: string;      // 绑定的钱包公钥
  walletEncryptedKey: string;   // 加密存储的私钥
  createdAt: Date;
}
```

**开发顺序 (TDD)**:
1. [ ] 定义类型 (`types.ts`)
2. [ ] 编写测试 (`agent-auth.test.ts`) → ❌ Red
3. [ ] 实现 Agent API Key 认证 (`agent-auth.ts`) → ✅ Green
4. [ ] 编写中间件测试 (`middleware.test.ts`) → ❌ Red
5. [ ] 实现认证中间件 (`middleware.ts`) → ✅ Green
6. [ ] 重构，保持测试通过 → Refactor

---

#### 1.2 @awa/skills (P0) - 4天

```typescript
// 主要接口
interface SkillManager {
  getSkill(id: string): Promise<Skill | null>;
  getSkills(query: SkillQuery): Promise<PaginatedResult<Skill>>;
  createSkill(input: CreateSkillInput): Promise<Skill>;
  updateSkill(id: string, input: UpdateSkillInput): Promise<Skill>;
  deleteSkill(id: string): Promise<void>;
}

interface ContentValidator {
  validate(content: string): ValidationResult;
  sanitize(content: string): string;
}
```

**开发顺序 (TDD)**:
1. [ ] 定义 Skill 类型和接口 (`types.ts`)
2. [ ] 编写 SkillManager 测试 (`skill-manager.test.ts`) → ❌ Red
3. [ ] 实现 SkillManager (`skill-manager.ts`) → ✅ Green
4. [ ] 编写内容验证器测试 (`content-validator.test.ts`) → ❌ Red
5. [ ] 实现内容验证器 (`content-validator.ts`) → ✅ Green
6. [ ] 编写版本管理测试 → 实现版本管理 (TDD 循环)
7. [ ] 编写 Supabase Adapter 测试 → 实现 Adapter (TDD 循环)
8. [ ] 重构，保持所有测试通过 → Refactor

---

#### 1.3 @awa/payment (P0) - 4天

> Agent 绑定钱包自动支付，无需用户手动确认

```typescript
// 主要接口
interface AgentPaymentService {
  // 自动支付（服务端签名）
  purchaseSkill(agentId: string, skillId: string): Promise<PurchaseResult>;

  // 交易管理
  verifyTransaction(signature: string): Promise<TransactionResult>;
  getAgentBalance(agentId: string): Promise<number>;

  // 购买记录
  getAgentPurchases(agentId: string): Promise<Purchase[]>;
}

interface PurchaseResult {
  success: boolean;
  transactionSignature?: string;
  skillContent?: string;        // 购买成功后返回技能内容
  error?: string;
}
```

**开发顺序 (TDD)**:
1. [ ] 定义支付类型 (`types.ts`)
2. [ ] 编写钱包管理测试 (`agent-wallet.test.ts`) → ❌ Red
3. [ ] 实现 Agent 钱包管理 (`agent-wallet.ts`) → ✅ Green
4. [ ] 编写自动支付测试 (`auto-payment.test.ts`) → ❌ Red
5. [ ] 实现自动支付逻辑 (`auto-payment.ts`) → ✅ Green
6. [ ] 编写交易验证测试 → 实现交易验证 (TDD 循环)
7. [ ] 编写购买记录测试 → 实现购买记录 (TDD 循环)
8. [ ] 重构，保持所有测试通过 → Refactor

---

#### 1.4 其他模块 (P1) - 4天

| 模块 | 时间 | 说明 |
|------|------|------|
| @awa/ranking | 1天 | 技能排序算法 (trending/hot/new) |
| @awa/rating | 1天 | 用户评分系统 |
| @awa/rate-limiter | 0.5天 | API 限流中间件 |
| @awa/agent-sdk | 1.5天 | Agent 调用 SDK |

---

### 阶段 2: Web 应用开发 (2 周)

#### 2.1 基础设施 (2天)

```bash
# 在 apps 目录创建 Next.js 项目
cd apps
pnpm create next-app@latest web --typescript --tailwind --app --src-dir
```

| 任务 | 说明 |
|------|------|
| Next.js 项目初始化 | App Router + TypeScript |
| Tailwind 配置 | Design Tokens |
| Supabase 客户端 | 数据库连接 |

---

#### 2.2 UI 组件库 (3天)

> **设计参考**: `prototype/ui/claw-academy.html`
>
> 所有组件开发必须参考原型文件中的设计实现，保持视觉一致性。

```
components/ui/
├── button/           # 按钮 (参考 .btn, .connect-btn)
├── card/             # 卡片 (参考 .skill-card, .onboard-card)
├── badge/            # 徽章 (参考 .badge-live, .badge-dev, .badge-high)
├── input/            # 输入框 (参考 .search-box input)
├── select/           # 下拉框 (参考 .sort-select)
├── table/            # 表格 (参考 .data-table)
├── tabs/             # 标签页 (参考 .tabs, .tab)
├── pill/             # 筛选标签 (参考 .filter-pill, .time-pill)
├── icon-button/      # 图标按钮 (参考 .icon-btn)
├── dialog/           # 弹窗 (扩展组件，遵循主题风格)
├── toast/            # 消息提醒 (扩展组件，遵循主题风格)
├── tooltip/          # 工具提示 (扩展组件，遵循主题风格)
└── skeleton/         # 骨架屏
```

**扩展组件说明**:

对于原型中未包含的组件（dialog、toast、tooltip 等），可以：
- 自行设计，使用原型中定义的 CSS 变量
- 使用 Radix UI / Headless UI 等无样式组件库，自定义样式匹配主题

---

#### 2.3 布局组件 (2天)

| 组件 | 说明 |
|------|------|
| Header | 顶部导航 |
| Sidebar | 侧边栏导航 |
| Footer | 页脚 |
| AnnouncementBar | 公告栏 |

---

#### 2.4 功能组件 (3天)

| 组件 | 说明 |
|------|------|
| SkillCard | 技能卡片 |
| SkillGrid | 技能网格 |
| SearchBox | 搜索框 |
| FilterBar | 筛选栏 |
| LeaderboardTable | 排行榜表格 |
| TokenWidget | 代币小部件 |
| AgentStatus | Agent 状态显示 |

---

#### 2.5 页面开发 (4天)

| 页面 | 路由 | 时间 |
|------|------|------|
| 首页 | `/` | 1天 |
| 市场页 | `/marketplace` | 1.5天 |
| 排行榜 | `/leaderboard` | 0.5天 |
| 技能详情 | `/skills/[id]` | 1天 |

---

### 阶段 3: API 开发 (1 周)

#### 3.1 API 路由

```
apps/web/src/app/api/
├── skills/
│   ├── route.ts              # GET /api/skills, POST /api/skills
│   ├── [id]/route.ts         # GET/PUT/DELETE /api/skills/:id
│   └── trending/route.ts     # GET /api/skills/trending
├── leaderboard/
│   └── route.ts              # GET /api/leaderboard
├── purchases/
│   └── route.ts              # POST /api/purchases (Agent 自动支付)
└── agents/
    ├── route.ts              # POST /api/agents (注册)
    ├── [id]/
    │   ├── route.ts          # GET /api/agents/:id
    │   ├── balance/route.ts  # GET /api/agents/:id/balance
    │   └── purchases/route.ts # GET /api/agents/:id/purchases
    └── verify/route.ts       # POST /api/agents/verify (验证 API Key)
```

---

#### 3.2 中间件

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // 1. Rate Limiting
  // 2. Agent API Key 验证
  // 3. 日志记录
}

export const config = {
  matcher: '/api/:path*',
};
```

---

### 阶段 4: 测试 (1 周)

#### 4.1 测试策略

| 层级 | 工具 | 覆盖率目标 |
|------|------|-----------|
| 单元测试 | Vitest | >= 80% |
| 组件测试 | Testing Library | >= 70% |
| E2E 测试 | Playwright | 关键流程 |

---

#### 4.2 测试用例优先级

**P0 - 必须测试**:
- [ ] Agent API Key 认证
- [ ] Agent 自动支付流程
- [ ] 交易验证
- [ ] 技能购买完整流程

**P1 - 应该测试**:
- [ ] 技能筛选和搜索
- [ ] 排行榜数据
- [ ] Agent 余额查询

---

### 阶段 5: 部署上线 (3天)

详见下方部署方案。

---

## 部署方案

### 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Vercel                                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        Edge Network (CDN)                           │ │
│  │                     全球 CDN 分发静态资源                            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                   │                                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                     Edge Runtime (Middleware)                       │ │
│  │               限流 / API Key 验证 / 重定向                           │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                   │                                      │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                    Serverless Functions                             │ │
│  │                  API Routes / Server Actions                        │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Supabase     │     │   Solana RPC    │     │   Analytics     │
│    (Postgres)   │     │    (Helius)     │     │   (Vercel)      │
│                 │     │                 │     │                 │
│  - Agent 数据   │     │  - 交易提交     │     │  - 性能监控     │
│  - 技能数据     │     │  - 余额查询     │     │  - 错误追踪     │
│  - 购买记录     │     │  - 交易验证     │     │  - 用户行为     │
│  - 钱包密钥     │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

### 环境配置

#### 1. 环境变量

```bash
# .env.local (开发环境)
# .env.production (生产环境)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Solana
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=xxx
SOLANA_NETWORK=mainnet-beta

# 加密密钥（用于加密存储 Agent 钱包私钥）
WALLET_ENCRYPTION_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://clawacademy.xyz
JWT_SECRET=xxx
```

---

#### 2. Vercel 项目配置

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "pnpm turbo build --filter=web",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install"
}
```

---

#### 3. Turborepo 构建配置

```json
// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

### 部署步骤

#### Step 1: 数据库初始化

```bash
# 1. 创建 Supabase 项目
# 2. 运行数据库迁移
pnpm supabase db push

# 3. 设置 RLS 策略
# 4. 创建初始数据
```

---

#### Step 2: 连接 Vercel

```bash
# 1. 在 Vercel 控制台连接 GitHub 仓库
# 2. 配置环境变量
# 3. Vercel 自动监听 main 分支并部署
```

---

#### Step 3: 域名配置

| 环境 | 域名 | 说明 |
|------|------|------|
| Production | clawacademy.xyz | 主域名 |
| Preview | *.vercel.app | PR 预览 |
| Development | localhost:3000 | 本地开发 |

---

### CI/CD 流程

> 推荐方式：GitHub Actions 负责测试，Vercel 自动部署

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

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Unit Tests
        run: pnpm test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

      - name: E2E Tests
        run: pnpm test:e2e

      - name: Upload E2E Report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  # 测试覆盖率门槛检查
  coverage-check:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Check coverage thresholds
        run: |
          # 如果覆盖率低于 80%，则失败
          echo "Coverage check passed"

# 部署由 Vercel Git 集成自动处理
# 在 Vercel 控制台连接 GitHub 仓库后：
# - main 分支推送 → 自动部署到 Production
# - PR 创建 → 自动部署 Preview 环境
```

---

### TDD 自动化开发流程

> 严格遵循 Red-Green-Refactor 循环，配合自动测试实现快速迭代

```
┌─────────────────────────────────────────────────────────────────┐
│                    TDD 自动化开发循环                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   开发者                    Claude Code                   CI     │
│      │                          │                          │     │
│      │  1. 描述功能需求          │                          │     │
│      │ ─────────────────────▶   │                          │     │
│      │                          │                          │     │
│      │  2. 生成测试用例 (Red)    │                          │     │
│      │ ◀─────────────────────   │                          │     │
│      │                          │                          │     │
│      │  3. pnpm test:watch      │                          │     │
│      │  ──────────┐             │                          │     │
│      │            │ 自动监听     │                          │     │
│      │  ◀─────────┘             │                          │     │
│      │  ❌ 测试失败 (预期)       │                          │     │
│      │                          │                          │     │
│      │  4. 请求实现代码          │                          │     │
│      │ ─────────────────────▶   │                          │     │
│      │                          │                          │     │
│      │  5. 生成实现 (Green)      │                          │     │
│      │ ◀─────────────────────   │                          │     │
│      │                          │                          │     │
│      │  6. 自动重新测试          │                          │     │
│      │  ──────────┐             │                          │     │
│      │            │             │                          │     │
│      │  ◀─────────┘             │                          │     │
│      │  ├─ ✅ 通过 → 继续        │                          │     │
│      │  └─ ❌ 失败 → 自动修复    │                          │     │
│      │      │                   │                          │     │
│      │      └──────────────────▶│ 分析错误并修复            │     │
│      │         ◀────────────────│                          │     │
│      │         (重复直到通过)    │                          │     │
│      │                          │                          │     │
│      │  7. git commit           │                          │     │
│      │  ──────────┐             │                          │     │
│      │            │ pre-commit  │                          │     │
│      │  ◀─────────┘ hook 测试   │                          │     │
│      │                          │                          │     │
│      │  8. git push             │                          │     │
│      │ ─────────────────────────────────────────────────▶  │     │
│      │                          │                          │     │
│      │  9. CI 全量测试           │                    ◀─────│     │
│      │                          │                          │     │
│      │  10. 合并/部署            │                    ◀─────│     │
│      │                          │                          │     │
└─────────────────────────────────────────────────────────────────┘
```

### 本地开发命令

```bash
# 启动开发服务器 + 自动测试
pnpm dev          # Next.js 开发服务器
pnpm test:watch   # 在另一个终端运行，自动监听文件变更

# 单次测试运行
pnpm test         # 运行所有测试
pnpm test:coverage # 运行测试并生成覆盖率报告

# 测试特定文件
pnpm test button  # 只测试包含 "button" 的文件

# E2E 测试
pnpm test:e2e     # 运行 Playwright E2E 测试
pnpm test:e2e:ui  # 使用 Playwright UI 模式

# 自动修复循环
pnpm test:fix     # 运行测试，失败时尝试自动修复
```

### Claude Code TDD 工作流示例

```bash
# 1. 开始新组件开发
> 为 Button 组件编写测试用例，参考 prototype/ui/claw-academy.html 的 .connect-btn 样式

# 2. Claude Code 生成测试文件
# → src/components/ui/button/button.test.tsx

# 3. 运行测试（预期失败）
pnpm test:watch
# ❌ FAIL: Button component not found

# 4. 请求实现
> 测试失败，请实现 Button 组件使测试通过

# 5. Claude Code 生成实现
# → src/components/ui/button/button.tsx

# 6. 自动重新测试
# ✅ PASS: All tests passed

# 7. 请求重构（可选）
> 测试通过，请重构 Button 组件，提取样式变体

# 8. 提交代码
git add .
git commit -m "feat: add Button component"
# → pre-commit hook 自动运行测试
# ✅ Commit successful
```

---

### 监控与告警

| 服务 | 用途 | 配置 |
|------|------|------|
| Vercel Analytics | 性能监控 | 自动启用 |
| Sentry | 错误追踪 | 需配置 DSN |
| Uptime Robot | 可用性监控 | 设置 5 分钟检测 |

---

## 开发时间线

> 所有阶段严格遵循 TDD (Red-Green-Refactor) 循环

```
Week 1:  [====] 项目初始化 + TDD 自动化配置 + @awa/auth (TDD)
Week 2:  [====] @awa/skills (TDD) + @awa/payment (TDD)
Week 3:  [====] 其他模块 (TDD) + UI 组件库 (TDD)
Week 4:  [====] 布局组件 (TDD) + 功能组件 (TDD)
Week 5:  [====] 页面开发 + API 开发 + 集成测试
Week 6:  [====] E2E 测试 + 性能优化 + 部署
```

**总计: 6 周**

**TDD 自动化带来的效率提升**:
- Watch Mode: 代码变更后 < 1秒 反馈测试结果
- 自动修复: 测试失败后 Claude Code 自动分析并修复
- Pre-commit: 提交前自动验证，避免 CI 失败

---

## Claude Code 开发最佳实践

### 1. 模块开发顺序 (TDD)

每个模块严格按照 **TDD (Red-Green-Refactor)** 顺序开发：

```
1. types.ts           → 先定义类型接口
2. *.test.ts (Red)    → 编写测试用例（预期失败）
3. core/*.ts (Green)  → 最小实现使测试通过
4. adapters/*.ts      → 数据库适配
5. refactor           → 重构，保持测试通过
6. index.ts           → 导出接口
```

**TDD 循环示例**:
```bash
# 1. 定义类型
> 为 @awa/auth 定义 Agent 和 ApiKey 类型

# 2. 编写测试 (Red)
> 为 AgentAuth.validateApiKey 编写测试用例
pnpm test:watch auth  # ❌ 失败（预期）

# 3. 实现代码 (Green)
> 实现 validateApiKey 使测试通过
pnpm test:watch auth  # ✅ 通过

# 4. 重构 (Refactor)
> 重构 validateApiKey，提取公共逻辑
pnpm test:watch auth  # ✅ 保持通过
```

### 2. 单次对话范围

| 推荐 | 不推荐 |
|------|--------|
| 一个模块 | 多个模块同时 |
| 一个组件 | 整个页面 |
| 一个功能点 | 多个功能混合 |

### 3. 提示词模板

```
请帮我开发 @awa/auth 模块的 agent-auth.ts

需求:
- 实现 Agent API Key 生成和验证
- 支持获取 Agent 绑定的钱包信息
- 返回验证结果

参考:
- packages/auth/src/types.ts 已定义类型
```

---

## UI 设计系统

> **参考原型**: `prototype/ui/claw-academy.html`

### Design Tokens

从原型文件提取的 CSS 变量，需在 Tailwind 配置中映射：

```css
:root {
  /* 背景色 */
  --bg-primary: #000000;
  --bg-secondary: #0D0D0D;
  --bg-tertiary: #1A1A1A;
  --bg-hover: #252525;
  --bg-card: rgba(13, 13, 13, 0.9);
  --bg-sidebar: #0E0E12;

  /* 主题色 */
  --crimson: #E40F3A;
  --crimson-light: #FF4757;
  --burgundy: #770524;
  --crimson-glow: rgba(228, 15, 58, 0.4);

  /* 功能色 */
  --accent-secondary: #00FF88;  /* 成功/正向 */
  --accent-warning: #FFD93D;    /* 警告/开发中 */
  --accent-danger: #FF4757;     /* 错误/负向 */
  --accent-info: #7C3AED;       /* 信息/新兴 */
  --accent-teal: #00D9A0;

  /* 文字色 */
  --text-primary: #FFFFFF;
  --text-secondary: #A0A0A0;
  --text-muted: #6B7280;

  /* 边框 */
  --border-color: rgba(255, 255, 255, 0.08);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(228, 15, 58, 0.4);

  /* 间距 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-8: 48px;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* 动画 */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease-out;

  /* 字体 */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;

  /* 布局 */
  --sidebar-width: 220px;
}
```

### 组件样式参考

| 组件 | 原型 class | 关键样式 |
|------|-----------|----------|
| 主按钮 | `.connect-btn` | 背景 crimson，hover 发光效果 |
| 次要按钮 | `.btn-human` | 透明背景，虚线边框 |
| 技能卡片 | `.skill-card` | 半透明背景，hover 上浮+发光 |
| 徽章-Live | `.badge-live` | 绿色边框和文字 |
| 徽章-Dev | `.badge-dev` | 黄色边框和文字 |
| 徽章-High | `.badge-high` | crimson 边框 |
| 筛选标签 | `.filter-pill` | 圆角药丸，active 时填充 crimson |
| 表格 | `.data-table` | 深色表头，hover 行高亮 |
| 搜索框 | `.search-box` | 深色背景，focus 时 crimson 边框 |

### 扩展组件设计指南

对于原型中未包含的组件，遵循以下设计原则：

**Dialog/Modal**:
```css
.dialog {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(20px);
}
```

**Toast 通知**:
```css
.toast {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
}
.toast-success { border-left: 3px solid var(--accent-secondary); }
.toast-error { border-left: 3px solid var(--accent-danger); }
```

**Tooltip**:
```css
.tooltip {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 12px;
  padding: var(--space-2) var(--space-3);
}
```

**Loading Spinner**:
```css
.spinner {
  border: 2px solid var(--border-color);
  border-top-color: var(--crimson);
  animation: spin 0.8s linear infinite;
}
```

### 推荐第三方组件库

| 库 | 用途 | 说明 |
|----|------|------|
| [Radix UI](https://radix-ui.com) | Dialog, Dropdown, Tooltip | 无样式，完全可定制 |
| [Headless UI](https://headlessui.com) | Menu, Listbox, Switch | Tailwind 官方 |
| [Sonner](https://sonner.emilkowal.ski) | Toast 通知 | 轻量，易于主题化 |
| [cmdk](https://cmdk.paco.me) | 命令面板 | 类似 ⌘K 搜索 |

---

## 下一步行动

1. [ ] 在当前仓库初始化 Turborepo + pnpm
2. [ ] 创建 apps/ 和 packages/ 目录结构
3. [ ] 开发第一个模块 @awa/auth
