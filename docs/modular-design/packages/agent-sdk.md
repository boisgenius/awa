# @clawacademy/agent-sdk

> OpenClaw Agent 开发 SDK - 让 AI Agent 接入 Claw Academy

## 安装

```bash
npm install @clawacademy/agent-sdk
# or
pnpm add @clawacademy/agent-sdk
```

## 功能特性

- **Agent 注册** - 自动注册并获取 claim token
- **技能获取** - 读取已购买的技能内容
- **认证管理** - API Key 安全存储
- **TypeScript** - 完整类型支持
- **多平台** - Node.js / Deno / Bun

---

## 快速开始

### 初始化

```typescript
import { ClawAgent } from '@clawacademy/agent-sdk';

const agent = new ClawAgent({
  apiKey: process.env.CLAW_API_KEY,
  // 或从文件读取
  // apiKeyFile: '~/.claw/credentials',
});
```

### 注册新 Agent

```typescript
import { ClawAgent } from '@clawacademy/agent-sdk';

// 1. 创建未认领的 Agent
const registration = await ClawAgent.register({
  name: 'MyResearchAgent',
  type: 'openclaw',
});

console.log('Claim your agent at:', registration.claimUrl);
console.log('Tweet this to verify:', registration.tweetTemplate);
// "I'm claiming my @ClawAcademy agent. Token: abc123"

// 2. 用户完成认领后，使用 API Key
const agent = new ClawAgent({
  apiKey: registration.apiKey, // 认领后获得
});
```

### 获取技能

```typescript
// 列出所有可用技能（已购买的）
const skills = await agent.skills.list();

for (const skill of skills) {
  console.log(`${skill.name} (v${skill.version})`);
}

// 获取技能详情
const skill = await agent.skills.get('skill-uuid');
console.log(skill.name, skill.description);

// 获取技能内容（Markdown）
const content = await agent.skills.getContent('skill-uuid');
console.log(content);
// # Research Master Pro
// ## 概述
// ...

// 检查是否有权限
const hasAccess = await agent.skills.hasAccess('skill-uuid');
```

### 学习技能

```typescript
// Agent "学习" 技能 = 读取 Markdown 内容
const content = await agent.skills.getContent('research-master-pro');

// 将内容注入到 Agent 的上下文中
// 这取决于你的 Agent 框架实现
myAgent.addToContext(content);

// 或者使用便捷方法
const instructions = await agent.skills.getInstructions('research-master-pro');
// 返回格式化后的指令文本
```

---

## API 参考

### ClawAgent

```typescript
class ClawAgent {
  constructor(options: ClawAgentOptions);

  // 静态方法
  static register(params: RegisterParams): Promise<RegistrationResult>;

  // 属性
  readonly skills: SkillsAPI;
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

  // 获取格式化指令
  getInstructions(idOrSlug: string): Promise<string>;

  // 检查访问权限
  hasAccess(idOrSlug: string): Promise<boolean>;

  // 搜索技能（仅已购买的）
  search(query: string): Promise<AgentSkill[]>;
}
```

### ProfileAPI

```typescript
interface ProfileAPI {
  // 获取 Agent 信息
  me(): Promise<AgentProfile>;

  // 获取 Owner 信息
  owner(): Promise<OwnerProfile>;

  // 更新 Agent 状态
  updateStatus(status: AgentStatus): Promise<void>;
}
```

---

## 类型定义

```typescript
interface ClawAgentOptions {
  apiKey?: string;
  apiKeyFile?: string;
  baseUrl?: string;        // 默认 'https://api.claw.academy'
  timeout?: number;        // 默认 30000ms
}

interface RegisterParams {
  name: string;
  type?: string;           // 默认 'openclaw'
}

interface RegistrationResult {
  claimToken: string;
  claimUrl: string;
  tweetTemplate: string;
  expiresAt: number;
  apiKey?: string;         // 认领后才有
}

interface AgentSkill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  version: string;
  features: string[];
  hasAccess: boolean;
}

interface AgentProfile {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  claimedAt: Date;
  lastSeenAt: Date;
}

interface OwnerProfile {
  id: string;
  walletAddress: string;
  twitterHandle?: string;
  purchasedSkills: number;
}

type AgentStatus = 'online' | 'offline' | 'busy';
```

---

## 使用示例

### 与 OpenClaw 集成

```typescript
// openclaw-agent.ts
import { ClawAgent } from '@clawacademy/agent-sdk';
import { OpenClawAgent } from 'openclaw';

const claw = new ClawAgent({
  apiKey: process.env.CLAW_API_KEY,
});

const agent = new OpenClawAgent({
  name: 'ResearchBot',
  async onInit() {
    // 加载所有已购买的技能
    const skills = await claw.skills.list();

    for (const skill of skills) {
      const content = await claw.skills.getContent(skill.id);
      this.addSkill(skill.name, content);
    }
  },
});

agent.start();
```

### 按需加载技能

```typescript
const agent = new ClawAgent({ apiKey });

// 用户请求时动态加载
async function handleUserRequest(request: string) {
  // 判断需要什么技能
  if (request.includes('research')) {
    const content = await agent.skills.getContent('research-master-pro');
    return processWithSkill(content, request);
  }

  if (request.includes('code')) {
    const content = await agent.skills.getContent('solana-dev-expert');
    return processWithSkill(content, request);
  }
}
```

### CLI 工具

```typescript
#!/usr/bin/env node
import { ClawAgent } from '@clawacademy/agent-sdk';
import { Command } from 'commander';

const program = new Command();

program
  .command('register <name>')
  .description('Register a new agent')
  .action(async (name) => {
    const result = await ClawAgent.register({ name });
    console.log('Claim URL:', result.claimUrl);
    console.log('Tweet:', result.tweetTemplate);
  });

program
  .command('skills')
  .description('List available skills')
  .action(async () => {
    const agent = new ClawAgent({ apiKeyFile: '~/.claw/credentials' });
    const skills = await agent.skills.list();

    for (const skill of skills) {
      console.log(`- ${skill.name} (${skill.category})`);
    }
  });

program
  .command('learn <skill>')
  .description('Get skill content')
  .action(async (skill) => {
    const agent = new ClawAgent({ apiKeyFile: '~/.claw/credentials' });
    const content = await agent.skills.getContent(skill);
    console.log(content);
  });

program.parse();
```

---

## 错误处理

```typescript
import {
  ClawAgent,
  AuthenticationError,
  SkillNotFoundError,
  AccessDeniedError,
} from '@clawacademy/agent-sdk';

try {
  const content = await agent.skills.getContent('premium-skill');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof SkillNotFoundError) {
    console.error('Skill does not exist');
  } else if (error instanceof AccessDeniedError) {
    console.error('Skill not purchased');
  }
}
```

---

## 安全注意事项

### API Key 存储

```typescript
// 不要硬编码
const agent = new ClawAgent({
  apiKey: 'claw_abc123...', // ❌ 不安全
});

// 使用环境变量
const agent = new ClawAgent({
  apiKey: process.env.CLAW_API_KEY, // ✅
});

// 或使用文件
const agent = new ClawAgent({
  apiKeyFile: '~/.claw/credentials', // ✅
});
```

### 权限范围

Agent SDK 只有 **只读** 权限：
- ✅ 读取已购买的技能
- ✅ 获取 Agent/Owner 信息
- ❌ 不能发帖（与 Moltbook 不同）
- ❌ 不能修改数据
- ❌ 不能访问未购买的技能

---

## 测试

```typescript
import { ClawAgent, MockClawApi } from '@clawacademy/agent-sdk/testing';

describe('ClawAgent', () => {
  let agent: ClawAgent;
  let mockApi: MockClawApi;

  beforeEach(() => {
    mockApi = new MockClawApi();
    mockApi.addSkill({
      id: 'test-skill',
      name: 'Test Skill',
      content: '# Test\n\nThis is a test skill.',
    });

    agent = new ClawAgent({
      apiKey: 'test-key',
      baseUrl: mockApi.url,
    });
  });

  it('lists available skills', async () => {
    const skills = await agent.skills.list();
    expect(skills).toHaveLength(1);
    expect(skills[0].name).toBe('Test Skill');
  });

  it('gets skill content', async () => {
    const content = await agent.skills.getContent('test-skill');
    expect(content).toContain('# Test');
  });
});
```

---

## 未来计划

- [ ] Swift SDK (`MoltbookSDK` 风格)
- [ ] Kotlin SDK
- [ ] Python SDK
- [ ] 技能缓存
- [ ] 离线模式
- [ ] WebSocket 实时更新
