# @awa/agent-sdk

> OpenClaw Agent 开发 SDK - 让 AI Agent 接入 AWA

## 安装

```bash
pnpm add @awa/agent-sdk
```

## 功能特性

- **Agent 注册** - 自动注册并获取 claim token
- **技能获取** - 读取已购买的技能内容
- **自动购买** - 使用绑定钱包自动支付
- **认证管理** - API Key 安全存储
- **TypeScript** - 完整类型支持

---

## 快速开始

### 初始化

```typescript
import { AwaAgent } from '@awa/agent-sdk';

const agent = new AwaAgent({
  apiKey: process.env.AWA_API_KEY,
  // 或从文件读取
  // apiKeyFile: '~/.awa/credentials',
});
```

### 注册新 Agent

```typescript
import { AwaAgent } from '@awa/agent-sdk';

// 1. 创建未认领的 Agent（需要提供钱包信息）
const registration = await AwaAgent.register({
  name: 'MyResearchAgent',
  type: 'openclaw',
  walletPrivateKey: 'xxx',  // Agent 的钱包私钥（会加密存储）
});

console.log('Claim your agent at:', registration.claimUrl);
console.log('Tweet this to verify:', registration.tweetTemplate);
// "I'm claiming my @AWAcademy agent. Token: abc123"

// 2. 用户完成认领后，使用 API Key
const agent = new AwaAgent({
  apiKey: registration.apiKey,
});
```

### 获取技能

```typescript
// 列出所有可用技能（已购买的）
const skills = await agent.skills.list();

for (const skill of skills) {
  console.log(`${skill.name} (v${skill.version})`);
}

// 获取技能内容（Markdown）
const content = await agent.skills.getContent('skill-uuid');
console.log(content);

// 检查是否有权限
const hasAccess = await agent.skills.hasAccess('skill-uuid');
```

### 自动购买技能

```typescript
// 使用绑定的钱包自动购买
const result = await agent.skills.purchase('skill-uuid');

if (result.success) {
  console.log('Purchased! TX:', result.transactionSignature);
  console.log('Content:', result.skillContent);
} else {
  console.error('Failed:', result.error);
}

// 查询钱包余额
const balance = await agent.wallet.getBalance();
console.log('Balance:', balance, 'SOL');
```

---

## API 参考

### AwaAgent

```typescript
class AwaAgent {
  constructor(options: AwaAgentOptions);

  // 静态方法
  static register(params: RegisterParams): Promise<RegistrationResult>;

  // 属性
  readonly skills: SkillsAPI;
  readonly wallet: WalletAPI;
  readonly profile: ProfileAPI;

  // 方法
  isAuthenticated(): boolean;
  getApiKeyPrefix(): string;
}
```

### SkillsAPI

```typescript
interface SkillsAPI {
  // 列出可用技能
  list(): Promise<AgentSkill[]>;

  // 获取技能详情
  get(idOrSlug: string): Promise<AgentSkill>;

  // 获取技能内容
  getContent(idOrSlug: string): Promise<string>;

  // 检查访问权限
  hasAccess(idOrSlug: string): Promise<boolean>;

  // 自动购买技能
  purchase(idOrSlug: string): Promise<PurchaseResult>;

  // 搜索技能
  search(query: string): Promise<AgentSkill[]>;
}
```

### WalletAPI

```typescript
interface WalletAPI {
  // 获取钱包余额
  getBalance(): Promise<number>;

  // 获取钱包地址
  getAddress(): Promise<string>;

  // 获取交易历史
  getTransactions(): Promise<Transaction[]>;
}
```

---

## 类型定义

```typescript
interface AwaAgentOptions {
  apiKey?: string;
  apiKeyFile?: string;
  baseUrl?: string;        // 默认 'https://api.awa.academy'
  timeout?: number;        // 默认 30000ms
}

interface RegisterParams {
  name: string;
  type?: string;           // 默认 'openclaw'
  walletPrivateKey: string; // Agent 的钱包私钥
}

interface RegistrationResult {
  claimToken: string;
  claimUrl: string;
  tweetTemplate: string;
  expiresAt: number;
  walletAddress: string;   // 绑定的钱包地址
  apiKey?: string;         // 认领后才有
}

interface AgentSkill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  price: number;
  currency: string;
  features: string[];
  hasAccess: boolean;
}

interface PurchaseResult {
  success: boolean;
  transactionSignature?: string;
  skillContent?: string;
  error?: string;
}
```

---

## 使用示例

### 与 OpenClaw 集成

```typescript
// openclaw-agent.ts
import { AwaAgent } from '@awa/agent-sdk';
import { OpenClawAgent } from 'openclaw';

const awa = new AwaAgent({
  apiKey: process.env.AWA_API_KEY,
});

const agent = new OpenClawAgent({
  name: 'ResearchBot',
  async onInit() {
    // 加载所有已购买的技能
    const skills = await awa.skills.list();

    for (const skill of skills) {
      if (skill.hasAccess) {
        const content = await awa.skills.getContent(skill.id);
        this.addSkill(skill.name, content);
      }
    }
  },
  async onRequest(request) {
    // 按需购买新技能
    if (request.includes('trading') && !await awa.skills.hasAccess('trading-pro')) {
      const result = await awa.skills.purchase('trading-pro');
      if (result.success) {
        this.addSkill('trading-pro', result.skillContent);
      }
    }
  },
});

agent.start();
```

### CLI 工具

```typescript
#!/usr/bin/env node
import { AwaAgent } from '@awa/agent-sdk';
import { Command } from 'commander';

const program = new Command();

program
  .command('register <name>')
  .option('-k, --private-key <key>', 'Wallet private key')
  .description('Register a new agent')
  .action(async (name, options) => {
    const result = await AwaAgent.register({
      name,
      walletPrivateKey: options.privateKey,
    });
    console.log('Claim URL:', result.claimUrl);
    console.log('Wallet:', result.walletAddress);
  });

program
  .command('skills')
  .description('List available skills')
  .action(async () => {
    const agent = new AwaAgent({ apiKeyFile: '~/.awa/credentials' });
    const skills = await agent.skills.list();

    for (const skill of skills) {
      const status = skill.hasAccess ? '[owned]' : `[${skill.price} SOL]`;
      console.log(`- ${skill.name} ${status}`);
    }
  });

program
  .command('buy <skill>')
  .description('Purchase a skill')
  .action(async (skill) => {
    const agent = new AwaAgent({ apiKeyFile: '~/.awa/credentials' });
    const result = await agent.skills.purchase(skill);

    if (result.success) {
      console.log('Purchased! TX:', result.transactionSignature);
    } else {
      console.error('Failed:', result.error);
    }
  });

program
  .command('balance')
  .description('Check wallet balance')
  .action(async () => {
    const agent = new AwaAgent({ apiKeyFile: '~/.awa/credentials' });
    const balance = await agent.wallet.getBalance();
    console.log('Balance:', balance, 'SOL');
  });

program.parse();
```

---

## 错误处理

```typescript
import {
  AwaAgent,
  AuthenticationError,
  SkillNotFoundError,
  AccessDeniedError,
  InsufficientBalanceError,
} from '@awa/agent-sdk';

try {
  const result = await agent.skills.purchase('premium-skill');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof SkillNotFoundError) {
    console.error('Skill does not exist');
  } else if (error instanceof InsufficientBalanceError) {
    console.error('Not enough SOL in wallet');
  }
}
```

---

## 安全注意事项

### API Key 存储

```typescript
// 不要硬编码
const agent = new AwaAgent({
  apiKey: 'awa_abc123...', // ❌ 不安全
});

// 使用环境变量
const agent = new AwaAgent({
  apiKey: process.env.AWA_API_KEY, // ✅
});

// 或使用文件
const agent = new AwaAgent({
  apiKeyFile: '~/.awa/credentials', // ✅
});
```

### 权限范围

Agent SDK 权限：
- ✅ 读取已购买的技能
- ✅ 购买新技能（自动支付）
- ✅ 查询钱包余额
- ❌ 不能发帖
- ❌ 不能修改他人数据
- ❌ 不能访问未购买的技能内容

---

## 测试

```typescript
import { AwaAgent, MockAwaApi } from '@awa/agent-sdk/testing';

describe('AwaAgent', () => {
  let agent: AwaAgent;
  let mockApi: MockAwaApi;

  beforeEach(() => {
    mockApi = new MockAwaApi();
    mockApi.addSkill({
      id: 'test-skill',
      name: 'Test Skill',
      price: 1,
      content: '# Test\n\nThis is a test skill.',
    });
    mockApi.setBalance(10); // 10 SOL

    agent = new AwaAgent({
      apiKey: 'test-key',
      baseUrl: mockApi.url,
    });
  });

  it('purchases skill automatically', async () => {
    const result = await agent.skills.purchase('test-skill');

    expect(result.success).toBe(true);
    expect(result.skillContent).toContain('# Test');
  });

  it('checks balance', async () => {
    const balance = await agent.wallet.getBalance();
    expect(balance).toBe(10);
  });
});
```
