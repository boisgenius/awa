# @clawacademy/rating

> 评分系统 - 星级评分、评论、统计

## 安装

```bash
npm install @clawacademy/rating
# or
pnpm add @clawacademy/rating
```

## 功能特性

- **星级评分** - 1-5 星评分
- **评论** - 可选文字评论
- **防重复** - 每用户每技能一次评分
- **统计** - 平均分、分布、趋势
- **Adapter 模式** - 数据库无关

---

## 快速开始

```typescript
import { RatingSystem, SupabaseRatingAdapter } from '@clawacademy/rating';

const rating = new RatingSystem({
  adapter: new SupabaseRatingAdapter(supabase),
});

// 评分
await rating.rate({
  skillId: 'skill-uuid',
  userId: 'user-uuid',
  score: 5,
  review: 'Excellent skill!', // 可选
});

// 获取平均分
const avg = await rating.getAverage('skill-uuid');
// 4.5

// 获取评分分布
const distribution = await rating.getDistribution('skill-uuid');
// { 1: 2, 2: 5, 3: 10, 4: 30, 5: 53 }

// 获取用户评分
const myRating = await rating.getUserRating('skill-uuid', 'user-uuid');
// { score: 5, review: 'Excellent skill!' }
```

---

## API 参考

### RatingSystem

```typescript
class RatingSystem {
  constructor(options: RatingSystemOptions);

  // 评分
  rate(params: RateParams): Promise<Rating>;
  updateRating(params: UpdateRatingParams): Promise<Rating>;
  removeRating(skillId: string, userId: string): Promise<void>;

  // 查询
  getRating(skillId: string, userId: string): Promise<Rating | null>;
  getRatings(skillId: string, options?: ListOptions): Promise<RatingListResult>;
  getUserRatings(userId: string, options?: ListOptions): Promise<RatingListResult>;

  // 统计
  getAverage(skillId: string): Promise<number>;
  getCount(skillId: string): Promise<number>;
  getDistribution(skillId: string): Promise<RatingDistribution>;
  getStats(skillId: string): Promise<RatingStats>;

  // 验证
  canRate(skillId: string, userId: string): Promise<boolean>;
}
```

### RatingAdapter 接口

```typescript
interface RatingAdapter {
  // CRUD
  createRating(input: CreateRatingInput): Promise<Rating>;
  updateRating(id: string, input: UpdateRatingInput): Promise<Rating>;
  deleteRating(id: string): Promise<void>;

  // 查询
  getRating(skillId: string, userId: string): Promise<Rating | null>;
  getRatingsBySkill(skillId: string, options?: ListOptions): Promise<{ ratings: Rating[]; total: number }>;
  getRatingsByUser(userId: string, options?: ListOptions): Promise<{ ratings: Rating[]; total: number }>;

  // 统计
  getAverageRating(skillId: string): Promise<number>;
  getRatingCount(skillId: string): Promise<number>;
  getRatingDistribution(skillId: string): Promise<RatingDistribution>;
}
```

---

## 类型定义

```typescript
interface Rating {
  id: string;
  skillId: string;
  userId: string;
  score: number;           // 1-5
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RateParams {
  skillId: string;
  userId: string;
  score: number;
  review?: string;
}

interface UpdateRatingParams {
  skillId: string;
  userId: string;
  score?: number;
  review?: string;
}

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

interface RatingStats {
  average: number;
  count: number;
  distribution: RatingDistribution;
}

interface ListOptions {
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
  page?: number;
  limit?: number;
}

interface RatingListResult {
  ratings: Rating[];
  total: number;
  page: number;
  limit: number;
}

interface RatingSystemOptions {
  adapter: RatingAdapter;
  minScore?: number;        // 默认 1
  maxScore?: number;        // 默认 5
  maxReviewLength?: number; // 默认 1000
  requirePurchase?: boolean; // 默认 true
}
```

---

## 验证规则

```typescript
const rating = new RatingSystem({
  adapter,
  minScore: 1,
  maxScore: 5,
  maxReviewLength: 1000,
  requirePurchase: true, // 必须购买后才能评分
});

// 验证
try {
  await rating.rate({
    skillId: 'skill-uuid',
    userId: 'user-uuid',
    score: 6, // 超出范围
  });
} catch (error) {
  // RatingValidationError: Score must be between 1 and 5
}
```

---

## 与 @clawacademy/skills 集成

```typescript
import { SkillManager } from '@clawacademy/skills';
import { RatingSystem } from '@clawacademy/rating';

const skills = new SkillManager({ adapter: skillAdapter });
const rating = new RatingSystem({ adapter: ratingAdapter });

// 评分后同步更新技能
async function rateSkill(skillId: string, userId: string, score: number) {
  // 添加评分
  await rating.rate({ skillId, userId, score });

  // 获取新的统计
  const stats = await rating.getStats(skillId);

  // 更新技能
  await skills.update(skillId, {
    rating: stats.average,
    ratingCount: stats.count,
  });
}
```

### 使用数据库触发器（推荐）

```sql
-- 自动更新技能评分
CREATE OR REPLACE FUNCTION update_skill_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE skills
  SET
    rating = (SELECT AVG(score) FROM ratings WHERE skill_id = NEW.skill_id),
    rating_count = (SELECT COUNT(*) FROM ratings WHERE skill_id = NEW.skill_id)
  WHERE id = NEW.skill_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_skill_rating
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW EXECUTE FUNCTION update_skill_rating();
```

---

## API 示例

### Next.js API Route

```typescript
// app/api/skills/[id]/rate/route.ts
import { rating } from '@/lib/rating';
import { authMiddleware } from '@clawacademy/auth/next';

export const POST = authMiddleware(async (req, { user }) => {
  const skillId = req.params.id;
  const { score, review } = await req.json();

  // 检查是否可以评分
  const canRate = await rating.canRate(skillId, user.id);
  if (!canRate) {
    return Response.json(
      { error: 'Must purchase skill before rating' },
      { status: 403 }
    );
  }

  // 评分
  const result = await rating.rate({
    skillId,
    userId: user.id,
    score,
    review,
  });

  return Response.json(result);
});
```

---

## 测试

```typescript
import { RatingSystem, InMemoryRatingAdapter } from '@clawacademy/rating';

describe('RatingSystem', () => {
  let rating: RatingSystem;

  beforeEach(() => {
    rating = new RatingSystem({
      adapter: new InMemoryRatingAdapter(),
    });
  });

  it('creates rating', async () => {
    const result = await rating.rate({
      skillId: 'skill-1',
      userId: 'user-1',
      score: 5,
    });

    expect(result.score).toBe(5);
  });

  it('calculates average', async () => {
    await rating.rate({ skillId: 'skill-1', userId: 'user-1', score: 5 });
    await rating.rate({ skillId: 'skill-1', userId: 'user-2', score: 3 });

    const avg = await rating.getAverage('skill-1');
    expect(avg).toBe(4);
  });

  it('prevents duplicate rating', async () => {
    await rating.rate({ skillId: 'skill-1', userId: 'user-1', score: 5 });

    // 重复评分会更新而不是创建新的
    await rating.rate({ skillId: 'skill-1', userId: 'user-1', score: 4 });

    const count = await rating.getCount('skill-1');
    expect(count).toBe(1);
  });

  it('validates score range', async () => {
    await expect(rating.rate({
      skillId: 'skill-1',
      userId: 'user-1',
      score: 6,
    })).rejects.toThrow('Score must be between 1 and 5');
  });
});
```
