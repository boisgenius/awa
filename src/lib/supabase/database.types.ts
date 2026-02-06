/**
 * Supabase Database Types
 * Auto-generated from database schema
 * Last updated: 2026-02-06
 */

export type SkillCategory = 'research' | 'finance' | 'coding' | 'security' | 'creative' | 'comms';
export type SkillStatus = 'live' | 'dev' | 'deprecated';
export type PaymentToken = 'SOL' | 'CLAW' | 'USDC';
export type PurchaseStatus = 'confirmed' | 'refunded' | 'pending' | 'failed';
export type AgentStatus = 'pending_claim' | 'active' | 'suspended' | 'expired';

export interface User {
  id: string;
  twitter_id: string | null;
  twitter_handle: string | null;
  twitter_verified_at: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  owner_id: string | null;
  name: string;
  description: string | null;
  agent_type: string;
  api_key_hash: string;
  api_key_prefix: string;
  wallet_public_key: string;
  wallet_encrypted_key: string;
  status: AgentStatus;
  claim_token: string | null;
  claim_token_expires_at: string | null;
  verification_code: string | null;
  claim_tweet_id: string | null;
  created_at: string;
  updated_at: string;
  claimed_at: string | null;
  last_active_at: string | null;
}

export interface Author {
  id: string;
  user_id: string | null;
  author_name: string;
  bio: string | null;
  is_verified: boolean;
  total_skills: number;
  total_downloads: number;
  created_at: string;
}

export interface SkillContent {
  files: Array<{
    path: string;
    content: string;
    size: number;
  }>;
  checksum?: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  author_id: string | null;
  category: SkillCategory;
  status: SkillStatus;
  price: number;
  currency: PaymentToken;
  content: SkillContent | null;
  version: string;
  icon_emoji: string | null;
  features: string[] | null;
  rating: number;
  downloads: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  agent_id: string;
  skill_id: string;
  price: number;
  currency: PaymentToken;
  tx_signature: string | null;
  tx_status: PurchaseStatus;
  created_at: string;
  confirmed_at: string | null;
}

export interface Favorite {
  id: string;
  agent_id: string;
  skill_id: string;
  created_at: string;
}

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, 'id'>>;
      };
      agents: {
        Row: Agent;
        Insert: Omit<Agent, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Agent, 'id'>>;
      };
      authors: {
        Row: Author;
        Insert: Omit<Author, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Author, 'id'>>;
      };
      skills: {
        Row: Skill;
        Insert: Omit<Skill, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Skill, 'id'>>;
      };
      purchases: {
        Row: Purchase;
        Insert: Omit<Purchase, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Purchase, 'id'>>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Favorite, 'id'>>;
      };
    };
    Enums: {
      skill_category: SkillCategory;
      skill_status: SkillStatus;
      payment_token: PaymentToken;
      purchase_status: PurchaseStatus;
      agent_status: AgentStatus;
    };
  };
}
