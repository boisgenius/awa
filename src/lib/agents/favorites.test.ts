import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => mockSupabase),
  select: vi.fn(() => mockSupabase),
  insert: vi.fn(() => mockSupabase),
  delete: vi.fn(() => mockSupabase),
  eq: vi.fn(() => mockSupabase),
  single: vi.fn(() => mockSupabase),
  order: vi.fn(() => mockSupabase),
};

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => mockSupabase,
}));

// Import after mocking
import {
  getAgentFavorites,
  isFavorited,
  addFavorite,
  removeFavorite,
  getSkillFavoriteCount,
} from './favorites';

describe('favorites service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock chain
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
  });

  describe('getAgentFavorites', () => {
    it('should return empty array when no favorites', async () => {
      mockSupabase.order.mockResolvedValue({ data: [], error: null });

      const result = await getAgentFavorites('agent-123');

      expect(result).toEqual([]);
      expect(mockSupabase.from).toHaveBeenCalledWith('favorites');
      expect(mockSupabase.eq).toHaveBeenCalledWith('agent_id', 'agent-123');
    });

    it('should return favorites with skill data', async () => {
      const mockData = [
        {
          id: 'fav-1',
          skill_id: 'skill-1',
          created_at: '2026-02-06T12:00:00Z',
          skills: {
            id: 'skill-1',
            name: 'Test Skill',
            slug: 'test-skill',
            description: 'A test skill',
            icon_emoji: '🎯',
            category: 'coding',
            price: 1.5,
            currency: 'SOL',
            rating: 4.5,
            downloads: 100,
          },
        },
      ];

      mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

      const result = await getAgentFavorites('agent-123');

      expect(result).toHaveLength(1);
      expect(result[0].skillId).toBe('skill-1');
      expect(result[0].skill.name).toBe('Test Skill');
      expect(result[0].skill.icon).toBe('🎯');
    });

    it('should return empty array on error', async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      const result = await getAgentFavorites('agent-123');

      expect(result).toEqual([]);
    });
  });

  describe('isFavorited', () => {
    it('should return true when favorited', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: 'fav-1' },
        error: null,
      });

      const result = await isFavorited('agent-123', 'skill-1');

      expect(result).toBe(true);
    });

    it('should return false when not favorited', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null,
      });

      const result = await isFavorited('agent-123', 'skill-1');

      expect(result).toBe(false);
    });
  });

  describe('addFavorite', () => {
    it('should add favorite successfully', async () => {
      // Mock skill exists check
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'skill-1' },
        error: null,
      });

      // Mock not already favorited
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      // Mock insert
      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await addFavorite('agent-123', 'skill-1');

      expect(result.success).toBe(true);
    });

    it('should fail when skill not found', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: null,
      });

      const result = await addFavorite('agent-123', 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Skill not found');
    });

    it('should fail when already favorited', async () => {
      // Mock skill exists
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'skill-1' },
        error: null,
      });

      // Mock already favorited
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'fav-1' },
        error: null,
      });

      const result = await addFavorite('agent-123', 'skill-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Skill already in favorites');
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite successfully', async () => {
      // Create a proper mock chain for delete().eq().eq()
      const mockEq2 = vi.fn().mockResolvedValue({ error: null });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ delete: mockDelete });

      const result = await removeFavorite('agent-123', 'skill-1');

      expect(result.success).toBe(true);
    });

    it('should fail on database error', async () => {
      const mockEq2 = vi.fn().mockResolvedValue({
        error: new Error('Delete failed'),
      });
      const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq1 });
      mockSupabase.from.mockReturnValue({ delete: mockDelete });

      const result = await removeFavorite('agent-123', 'skill-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to remove favorite');
    });
  });

  describe('getSkillFavoriteCount', () => {
    it('should return count', async () => {
      mockSupabase.eq.mockResolvedValue({ count: 42 });

      const result = await getSkillFavoriteCount('skill-1');

      expect(result).toBe(42);
    });

    it('should return 0 when no favorites', async () => {
      mockSupabase.eq.mockResolvedValue({ count: null });

      const result = await getSkillFavoriteCount('skill-1');

      expect(result).toBe(0);
    });
  });
});
