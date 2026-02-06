/**
 * Favorites Service
 * Handle agent skill favorites
 */

import { createServiceClient } from '@/lib/supabase/server';

export interface FavoriteSkill {
  id: string;
  skillId: string;
  skill: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    category: string;
    price: number;
    currency: string;
    rating: number;
    downloads: number;
  };
  createdAt: string;
}

/**
 * Get agent's favorite skills
 */
export async function getAgentFavorites(agentId: string): Promise<FavoriteSkill[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      skill_id,
      created_at,
      skills:skill_id (
        id,
        name,
        slug,
        description,
        icon_emoji,
        category,
        price,
        currency,
        rating,
        downloads
      )
    `)
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(f => {
    const skill = f.skills as any;
    return {
      id: f.id,
      skillId: f.skill_id,
      skill: {
        id: skill?.id,
        name: skill?.name,
        slug: skill?.slug,
        description: skill?.description,
        icon: skill?.icon_emoji,
        category: skill?.category,
        price: skill?.price,
        currency: skill?.currency,
        rating: skill?.rating,
        downloads: skill?.downloads,
      },
      createdAt: f.created_at,
    };
  });
}

/**
 * Check if agent has favorited a skill
 */
export async function isFavorited(agentId: string, skillId: string): Promise<boolean> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('agent_id', agentId)
    .eq('skill_id', skillId)
    .single();

  return !!data;
}

/**
 * Add a skill to favorites
 */
export async function addFavorite(agentId: string, skillId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  // Check if skill exists
  const { data: skill } = await supabase
    .from('skills')
    .select('id')
    .eq('id', skillId)
    .single();

  if (!skill) {
    return { success: false, error: 'Skill not found' };
  }

  // Check if already favorited
  const alreadyFavorited = await isFavorited(agentId, skillId);
  if (alreadyFavorited) {
    return { success: false, error: 'Skill already in favorites' };
  }

  // Add favorite
  const { error } = await supabase
    .from('favorites')
    .insert({
      agent_id: agentId,
      skill_id: skillId,
    });

  if (error) {
    console.error('Failed to add favorite:', error);
    return { success: false, error: 'Failed to add favorite' };
  }

  return { success: true };
}

/**
 * Remove a skill from favorites
 */
export async function removeFavorite(agentId: string, skillId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('agent_id', agentId)
    .eq('skill_id', skillId);

  if (error) {
    console.error('Failed to remove favorite:', error);
    return { success: false, error: 'Failed to remove favorite' };
  }

  return { success: true };
}

/**
 * Get favorite count for a skill
 */
export async function getSkillFavoriteCount(skillId: string): Promise<number> {
  const supabase = createServiceClient();

  const { count } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('skill_id', skillId);

  return count || 0;
}
