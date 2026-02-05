# @clawacademy/skills

> 技能管理核心模块 - CRUD、版本控制、内容验证

## 安装

```bash
npm install @clawacademy/skills
# or
pnpm add @clawacademy/skills
```

## 功能特性

- **技能 CRUD** - 创建、读取、更新、删除
- **版本管理** - 语义化版本、历史记录、回滚
- **内容验证** - Markdown 格式、安全检查
- **分类筛选** - 多维度查询
- **Adapter 模式** - 数据库无关

---

## 快速开始

### 基础用法

```typescript
import { SkillManager, SupabaseSkillAdapter } from '@clawacademy/skills';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const skills = new SkillManager({
  adapter: new SupabaseSkillAdapter(supabase),
});

// 创建技能
const skill = await skills.create({
  name: 'Research Master Pro',
  slug: 'research-master-pro',
  description: 'Advanced research techniques...',
  category: 'research',
  authorId: 'author-uuid',
  price: 2.5,
  content: '# Research Master Pro\n\n...',
  features: ['web-scraping', 'data-synthesis'],
});

// 获取技能
const skill = await skills.getById('skill-uuid');
const skill = await skills.getBySlug('research-master-pro');

// 查询技能列表
const { skills, total } = await skills.list({
  category: 'research',
  status: 'live',
  sortBy: 'downloads',
  page: 1,
  limit: 20,
});

// 更新技能
await skills.update('skill-uuid', {
  description: 'Updated description',
  price: 3.0,
});

// 删除技能（软删除）
await skills.delete('skill-uuid');
```

### 版本管理

```typescript
// 发布新版本
await skills.publishVersion('skill-uuid', {
  version: '1.1.0',
  content: '# Updated content...',
  changelog: 'Added new features...',
});

// 获取版本历史
const versions = await skills.getVersions('skill-uuid');
// [{ version: '1.1.0', ... }, { version: '1.0.0', ... }]

// 获取特定版本
const v1 = await skills.getVersion('skill-uuid', '1.0.0');

// 回滚到旧版本
await skills.rollback('skill-uuid', '1.0.0');
```

### 内容验证

```typescript
// 验证技能内容
const result = await skills.validateContent(content);

if (!result.valid) {
  console.error(result.errors);
  // [{ code: 'EMPTY_CONTENT', message: 'Content cannot be empty' }]
}

// 自动验证（创建/更新时）
try {
  await skills.create({ content: '', ... });
} catch (error) {
  // SkillValidationError: Content cannot be empty
}
```

---

## 查询 API

### 列表查询

```typescript
interface SkillQuery {
  // 筛选
  category?: SkillCategory;
  status?: 'live' | 'dev' | 'deprecated';
  authorId?: string;
  verified?: boolean;

  // 搜索
  search?: string;           // 全文搜索

  // 排序
  sortBy?: 'trending' | 'newest' | 'price-low' | 'price-high' | 'downloads' | 'rating';

  // 分页
  page?: number;             // 默认 1
  limit?: number;            // 默认 20，最大 100
}

// 使用
const result = await skills.list({
  category: 'coding',
  status: 'live',
  verified: true,
  search: 'solana',
  sortBy: 'trending',
  page: 1,
  limit: 12,
});

// 返回
interface SkillListResult {
  skills: Skill[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
```

### 聚合查询

```typescript
// 统计
const stats = await skills.getStats();
// { total: 1234, live: 890, categories: { research: 120, ... } }

// 分类计数
const counts = await skills.getCategoryCounts();
// { research: 120, finance: 89, coding: 234, ... }

// 热门标签
const tags = await skills.getPopularFeatures(10);
// ['web-scraping', 'data-analysis', 'solana', ...]
```

---

## 内容格式

### Markdown 结构

```markdown
# 技能名称

## 概述
简短描述这个技能的用途。

## 核心能力
- 能力 1
- 能力 2
- 能力 3

## 使用指南

### 基础用法
详细说明如何使用这个技能...

### 高级用法
更复杂的使用场景...

## 示例

### 示例 1: 基础查询
**用户**: 帮我研究 XXX
**助手**: 我将从以下方面进行研究...

## 限制
- 限制说明 1
- 限制说明 2
```

### 验证规则

| 规则 | 说明 |
|------|------|
| 非空 | 内容不能为空 |
| 最大长度 | 默认 100KB |
| 格式 | 必须是有效 Markdown |
| 安全 | 不能包含注入指令 |

```typescript
// 自定义验证规则
const skills = new SkillManager({
  adapter,
  validation: {
    maxContentLength: 200 * 1024,  // 200KB
    allowHtml: false,
    customRules: [
      {
        name: 'no-external-links',
        test: (content) => !content.includes('http'),
        message: 'External links not allowed',
      },
    ],
  },
});
```

---

## API 参考

### SkillManager

```typescript
class SkillManager {
  constructor(options: SkillManagerOptions);

  // CRUD
  create(input: CreateSkillInput): Promise<Skill>;
  getById(id: string): Promise<Skill | null>;
  getBySlug(slug: string): Promise<Skill | null>;
  update(id: string, input: UpdateSkillInput): Promise<Skill>;
  delete(id: string): Promise<void>;

  // 列表
  list(query: SkillQuery): Promise<SkillListResult>;

  // 版本
  publishVersion(id: string, input: PublishVersionInput): Promise<SkillVersion>;
  getVersions(id: string): Promise<SkillVersion[]>;
  getVersion(id: string, version: string): Promise<SkillVersion | null>;
  rollback(id: string, version: string): Promise<Skill>;

  // 内容
  getContent(id: string, version?: string): Promise<string>;
  validateContent(content: string): Promise<ValidationResult>;

  // 统计
  getStats(): Promise<SkillStats>;
  getCategoryCounts(): Promise<Record<SkillCategory, number>>;
  getPopularFeatures(limit?: number): Promise<string[]>;

  // 下载量
  incrementDownloads(id: string): Promise<void>;
}
```

### SkillAdapter 接口

```typescript
interface SkillAdapter {
  // 基础 CRUD
  getSkill(id: string): Promise<Skill | null>;
  getSkillBySlug(slug: string): Promise<Skill | null>;
  getSkills(query: SkillQuery): Promise<{ skills: Skill[]; total: number }>;
  createSkill(input: CreateSkillInput): Promise<Skill>;
  updateSkill(id: string, input: UpdateSkillInput): Promise<Skill>;
  deleteSkill(id: string): Promise<void>;

  // 版本
  createVersion(skillId: string, input: CreateVersionInput): Promise<SkillVersion>;
  getVersions(skillId: string): Promise<SkillVersion[]>;
  getVersion(skillId: string, version: string): Promise<SkillVersion | null>;

  // 统计
  getStats(): Promise<SkillStats>;
  incrementDownloads(id: string): Promise<void>;
}
```

---

## 类型定义

```typescript
type SkillCategory =
  | 'research'
  | 'finance'
  | 'coding'
  | 'security'
  | 'creative'
  | 'comms';

type SkillStatus = 'live' | 'dev' | 'deprecated';
type SkillPriority = 'high' | 'medium' | 'emerging';

interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: SkillCategory;
  status: SkillStatus;
  priority: SkillPriority;
  authorId: string;
  price: number;
  currency: 'SOL' | 'CLAW' | 'USDC';
  content: string;
  version: string;
  features: string[];
  iconEmoji?: string;
  iconGradient?: string;
  rating: number;
  ratingCount: number;
  downloads: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateSkillInput {
  name: string;
  slug: string;
  description: string;
  category: SkillCategory;
  authorId: string;
  price: number;
  content: string;
  features?: string[];
  iconEmoji?: string;
  iconGradient?: string;
}

interface UpdateSkillInput {
  name?: string;
  description?: string;
  status?: SkillStatus;
  priority?: SkillPriority;
  price?: number;
  features?: string[];
  iconEmoji?: string;
  iconGradient?: string;
}

interface SkillVersion {
  id: string;
  skillId: string;
  version: string;
  content: string;
  changelog?: string;
  createdAt: Date;
}

interface PublishVersionInput {
  version: string;
  content: string;
  changelog?: string;
}
```

---

## 与其他包集成

### @clawacademy/ranking

```typescript
import { SkillManager } from '@clawacademy/skills';
import { SkillRanker } from '@clawacademy/ranking';

const skills = new SkillManager({ adapter });
const ranker = new SkillRanker();

// 获取技能并排序
const { skills: allSkills } = await skills.list({ status: 'live' });
const trending = ranker.rank(allSkills, 'trending');
```

### @clawacademy/rating

```typescript
import { SkillManager } from '@clawacademy/skills';
import { RatingSystem } from '@clawacademy/rating';

const skills = new SkillManager({ adapter: skillAdapter });
const rating = new RatingSystem({ adapter: ratingAdapter });

// 评分后更新技能
await rating.rate('skill-uuid', 'user-uuid', 5);
const avg = await rating.getAverage('skill-uuid');
await skills.update('skill-uuid', { rating: avg });
```

---

## 测试

```typescript
import { SkillManager, InMemorySkillAdapter } from '@clawacademy/skills';

describe('SkillManager', () => {
  let skills: SkillManager;

  beforeEach(() => {
    skills = new SkillManager({
      adapter: new InMemorySkillAdapter(),
    });
  });

  it('creates skill with valid content', async () => {
    const skill = await skills.create({
      name: 'Test Skill',
      slug: 'test-skill',
      description: 'A test skill',
      category: 'coding',
      authorId: 'author-1',
      price: 1.0,
      content: '# Test Skill\n\nThis is a test.',
    });

    expect(skill.id).toBeDefined();
    expect(skill.version).toBe('1.0.0');
  });

  it('rejects empty content', async () => {
    await expect(skills.create({
      ...validInput,
      content: '',
    })).rejects.toThrow('Content cannot be empty');
  });

  it('publishes new version', async () => {
    const skill = await skills.create(validInput);

    await skills.publishVersion(skill.id, {
      version: '1.1.0',
      content: '# Updated\n\nNew content.',
      changelog: 'Updated content',
    });

    const updated = await skills.getById(skill.id);
    expect(updated.version).toBe('1.1.0');
  });
});
```
