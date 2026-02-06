import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkillManager, SkillManagerAdapter } from './skill-manager';
import type { Skill, SkillQuery, CreateSkillInput, UpdateSkillInput } from './types';

describe('SkillManager', () => {
  let skillManager: SkillManager;
  let mockAdapter: SkillManagerAdapter;

  const mockSkill: Skill = {
    id: 'skill-123',
    name: 'Web Research',
    slug: 'web-research',
    authorId: 'author-1',
    description: 'Advanced web research capabilities',
    category: 'research',
    status: 'live',
    priority: 'high',
    price: 0.5,
    rating: 4.5,
    ratingCount: 100,
    downloads: 1000,
    verified: true,
    features: ['Search', 'Summarize', 'Extract'],
    content: 'Skill content here...',
    version: '1.0.0',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };

  beforeEach(() => {
    mockAdapter = {
      getSkill: vi.fn(),
      getSkills: vi.fn(),
      createSkill: vi.fn(),
      updateSkill: vi.fn(),
      deleteSkill: vi.fn(),
      getSkillBySlug: vi.fn(),
    };
    skillManager = new SkillManager(mockAdapter);
  });

  describe('getSkill', () => {
    it('should return skill by id', async () => {
      vi.mocked(mockAdapter.getSkill).mockResolvedValue(mockSkill);

      const result = await skillManager.getSkill('skill-123');

      expect(result).toEqual(mockSkill);
      expect(mockAdapter.getSkill).toHaveBeenCalledWith('skill-123');
    });

    it('should return null if skill not found', async () => {
      vi.mocked(mockAdapter.getSkill).mockResolvedValue(null);

      const result = await skillManager.getSkill('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getSkills', () => {
    it('should return paginated skills with default options', async () => {
      const skills = [mockSkill];
      vi.mocked(mockAdapter.getSkills).mockResolvedValue({
        data: skills,
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      });

      const result = await skillManager.getSkills({});

      expect(result.data).toEqual(skills);
      expect(result.total).toBe(1);
      expect(mockAdapter.getSkills).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
      });
    });

    it('should filter skills by category', async () => {
      vi.mocked(mockAdapter.getSkills).mockResolvedValue({
        data: [mockSkill],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      });

      await skillManager.getSkills({ category: 'research' });

      expect(mockAdapter.getSkills).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'research' })
      );
    });

    it('should search skills by keyword', async () => {
      vi.mocked(mockAdapter.getSkills).mockResolvedValue({
        data: [mockSkill],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      });

      await skillManager.getSkills({ search: 'web' });

      expect(mockAdapter.getSkills).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'web' })
      );
    });

    it('should sort skills', async () => {
      vi.mocked(mockAdapter.getSkills).mockResolvedValue({
        data: [mockSkill],
        total: 1,
        page: 1,
        limit: 20,
        hasMore: false,
      });

      await skillManager.getSkills({ sort: 'trending' });

      expect(mockAdapter.getSkills).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'trending' })
      );
    });
  });

  describe('createSkill', () => {
    const createInput: CreateSkillInput = {
      name: 'New Skill',
      description: 'A new skill',
      category: 'coding',
      price: 1.0,
      features: ['Feature 1'],
      content: 'Content here',
    };

    it('should create a new skill', async () => {
      const newSkill = { ...mockSkill, id: 'new-skill-id', ...createInput };
      vi.mocked(mockAdapter.createSkill).mockResolvedValue(newSkill);

      const result = await skillManager.createSkill('author-1', createInput);

      expect(result).toEqual(newSkill);
      expect(mockAdapter.createSkill).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createInput,
          authorId: 'author-1',
          slug: 'new-skill',
          status: 'dev',
          priority: 'emerging',
        })
      );
    });

    it('should generate slug from name', async () => {
      const input = { ...createInput, name: 'My Amazing Skill!' };
      vi.mocked(mockAdapter.createSkill).mockResolvedValue(mockSkill);

      await skillManager.createSkill('author-1', input);

      expect(mockAdapter.createSkill).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'my-amazing-skill' })
      );
    });
  });

  describe('updateSkill', () => {
    const updateInput: UpdateSkillInput = {
      name: 'Updated Name',
      description: 'Updated description',
    };

    it('should update an existing skill', async () => {
      const updatedSkill = { ...mockSkill, ...updateInput };
      vi.mocked(mockAdapter.getSkill).mockResolvedValue(mockSkill);
      vi.mocked(mockAdapter.updateSkill).mockResolvedValue(updatedSkill);

      const result = await skillManager.updateSkill('skill-123', updateInput);

      expect(result).toEqual(updatedSkill);
      expect(mockAdapter.updateSkill).toHaveBeenCalledWith('skill-123', updateInput);
    });

    it('should throw error if skill not found', async () => {
      vi.mocked(mockAdapter.getSkill).mockResolvedValue(null);

      await expect(skillManager.updateSkill('nonexistent', updateInput)).rejects.toThrow(
        'Skill not found'
      );
    });
  });

  describe('deleteSkill', () => {
    it('should delete a skill', async () => {
      vi.mocked(mockAdapter.getSkill).mockResolvedValue(mockSkill);
      vi.mocked(mockAdapter.deleteSkill).mockResolvedValue(undefined);

      await skillManager.deleteSkill('skill-123');

      expect(mockAdapter.deleteSkill).toHaveBeenCalledWith('skill-123');
    });

    it('should throw error if skill not found', async () => {
      vi.mocked(mockAdapter.getSkill).mockResolvedValue(null);

      await expect(skillManager.deleteSkill('nonexistent')).rejects.toThrow(
        'Skill not found'
      );
    });
  });

  describe('getSkillBySlug', () => {
    it('should return skill by slug', async () => {
      vi.mocked(mockAdapter.getSkillBySlug).mockResolvedValue(mockSkill);

      const result = await skillManager.getSkillBySlug('web-research');

      expect(result).toEqual(mockSkill);
      expect(mockAdapter.getSkillBySlug).toHaveBeenCalledWith('web-research');
    });
  });
});
