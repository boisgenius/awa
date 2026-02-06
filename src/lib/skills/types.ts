// Skills Types

export interface Skill {
  id: string;
  name: string;
  slug: string;
  authorId: string;
  description: string;
  category: SkillCategory;
  status: SkillStatus;
  priority: SkillPriority;
  price: number;
  rating: number;
  ratingCount: number;
  downloads: number;
  verified: boolean;
  features: string[];
  content: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SkillCategory =
  | 'research'
  | 'finance'
  | 'coding'
  | 'security'
  | 'creative'
  | 'comms';

export type SkillStatus = 'live' | 'dev' | 'deprecated';

export type SkillPriority = 'high' | 'medium' | 'emerging';

export interface SkillQuery {
  category?: SkillCategory;
  status?: SkillStatus;
  search?: string;
  sort?: 'trending' | 'newest' | 'rating' | 'downloads';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface CreateSkillInput {
  name: string;
  description: string;
  category: SkillCategory;
  price: number;
  features: string[];
  content: string;
}

export interface UpdateSkillInput {
  name?: string;
  description?: string;
  category?: SkillCategory;
  status?: SkillStatus;
  price?: number;
  features?: string[];
  content?: string;
}
