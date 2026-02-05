# @clawacademy/ranking

> 技能排序算法 - Trending、Hot、New、Top

## 安装

```bash
npm install @clawacademy/ranking
# or
pnpm add @clawacademy/ranking
```

## 功能特性

- **多种算法** - Trending、Hot、New、Top、Rising
- **时间范围** - 24H、7D、30D、All
- **可定制** - 自定义权重和参数
- **无依赖** - 纯算法，不依赖数据库

---

## 快速开始

```typescript
import { SkillRanker } from '@clawacademy/ranking';

const ranker = new SkillRanker();

// 基础排序
const trending = ranker.rank(skills, 'trending');
const newest = ranker.rank(skills, 'new');
const topRated = ranker.rank(skills, 'top');

// 带时间范围
const topWeek = ranker.rank(skills, 'top', { timeRange: 'week' });
const hotToday = ranker.rank(skills, 'hot', { timeRange: 'day' });

// 分页
const page1 = ranker.rank(skills, 'trending', { limit: 12, offset: 0 });
const page2 = ranker.rank(skills, 'trending', { limit: 12, offset: 12 });
```

---

## 排序算法

### Trending（趋势）

综合评分、下载量和时间衰减：

```typescript
score = (downloads * 0.4 + rating * downloads * 0.3 + views * 0.3)
        / (hoursAge + 2) ^ 1.5
```

适合首页展示，平衡热度和新鲜度。

### Hot（热门）

Reddit 风格算法，侧重近期活跃度：

```typescript
score = log10(max(downloads, 1)) + (rating - 3) * 0.5
        + createdAt / 45000
```

### New（最新）

纯时间排序，最新优先：

```typescript
score = createdAt.getTime()
```

### Top（最佳）

按评分排序，可选时间范围：

```typescript
score = rating * log10(ratingCount + 1)
```

### Rising（上升）

识别快速增长的技能：

```typescript
score = (recentDownloads + 1) / (hoursAge ^ 1.5)
```

### Price（价格）

按价格排序：

```typescript
// price-low: 升序
// price-high: 降序
```

---

## API 参考

### SkillRanker

```typescript
class SkillRanker {
  constructor(options?: RankerOptions);

  // 排序
  rank<T extends RankableItem>(
    items: T[],
    algorithm: RankingAlgorithm,
    options?: RankOptions
  ): T[];

  // 单独算法
  trending<T extends RankableItem>(items: T[], options?: RankOptions): T[];
  hot<T extends RankableItem>(items: T[], options?: RankOptions): T[];
  new<T extends RankableItem>(items: T[], options?: RankOptions): T[];
  top<T extends RankableItem>(items: T[], options?: RankOptions): T[];
  rising<T extends RankableItem>(items: T[], options?: RankOptions): T[];

  // 计算单个分数
  calculateScore(item: RankableItem, algorithm: RankingAlgorithm): number;
}
```

### 类型定义

```typescript
type RankingAlgorithm =
  | 'trending'
  | 'hot'
  | 'new'
  | 'top'
  | 'rising'
  | 'price-low'
  | 'price-high'
  | 'downloads';

type TimeRange = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

interface RankableItem {
  id: string;
  rating: number;
  ratingCount: number;
  downloads: number;
  price: number;
  createdAt: Date;
  updatedAt?: Date;
}

interface RankerOptions {
  // 权重配置
  weights?: {
    downloads?: number;    // 默认 0.4
    rating?: number;       // 默认 0.3
    recency?: number;      // 默认 0.3
  };

  // 时间衰减
  decayFactor?: number;    // 默认 1.5
  decayOffset?: number;    // 默认 2 小时
}

interface RankOptions {
  timeRange?: TimeRange;
  limit?: number;
  offset?: number;
}
```

---

## 自定义权重

```typescript
const ranker = new SkillRanker({
  weights: {
    downloads: 0.5,    // 更重视下载量
    rating: 0.3,
    recency: 0.2,      // 减少时间权重
  },
  decayFactor: 1.2,    // 更慢的时间衰减
});
```

---

## 与 @clawacademy/skills 集成

```typescript
import { SkillManager } from '@clawacademy/skills';
import { SkillRanker } from '@clawacademy/ranking';

const skills = new SkillManager({ adapter });
const ranker = new SkillRanker();

// API Route
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || 'trending';
  const timeRange = searchParams.get('time') || 'all';

  // 获取所有技能
  const { skills: allSkills } = await skills.list({
    status: 'live',
    limit: 1000, // 获取所有用于排序
  });

  // 排序
  const ranked = ranker.rank(allSkills, sort as RankingAlgorithm, {
    timeRange: timeRange as TimeRange,
    limit: 20,
  });

  return Response.json({ skills: ranked });
}
```

---

## 性能考虑

```typescript
// 对于大量数据，考虑在数据库层面排序
// 此包适合客户端排序或小数据集

// 推荐：数据库查询 + 内存排序
const { skills } = await db.skills.list({
  status: 'live',
  limit: 100, // 先用数据库限制数量
});

const ranked = ranker.rank(skills, 'trending');
```

---

## 测试

```typescript
import { SkillRanker } from '@clawacademy/ranking';

describe('SkillRanker', () => {
  const ranker = new SkillRanker();

  const skills = [
    { id: '1', rating: 4.5, ratingCount: 100, downloads: 500, price: 1, createdAt: new Date('2024-01-01') },
    { id: '2', rating: 5.0, ratingCount: 10, downloads: 50, price: 2, createdAt: new Date('2024-01-15') },
    { id: '3', rating: 4.0, ratingCount: 200, downloads: 1000, price: 0.5, createdAt: new Date('2024-01-10') },
  ];

  it('ranks by trending', () => {
    const ranked = ranker.rank(skills, 'trending');
    // 综合考虑各因素
    expect(ranked[0].id).toBe('3'); // 下载量最高
  });

  it('ranks by new', () => {
    const ranked = ranker.rank(skills, 'new');
    expect(ranked[0].id).toBe('2'); // 最新
  });

  it('ranks by price-low', () => {
    const ranked = ranker.rank(skills, 'price-low');
    expect(ranked[0].id).toBe('3'); // 最便宜
  });
});
```
