import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Disaster = {
  id: string;
  title: string;
  description: string;
  disaster_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  latitude: number;
  longitude: number;
  affected_population: number;
  status: 'active' | 'responding' | 'resolved';
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type AISummary = {
  id: string;
  disaster_id: string;
  summary: string;
  key_insights: string[];
  recommended_actions: string[];
  confidence_score: number;
  model_used: string;
  created_at: string;
};

export type PriorityAction = {
  id: string;
  disaster_id: string;
  action_type: 'rescue' | 'medical' | 'logistics' | 'communication';
  description: string;
  priority_score: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_resources: any[];
  estimated_impact: number;
  deadline: string | null;
  completed_at: string | null;
  allocation_score?: number;
  created_at: string;
};

export type Resource = {
  id: string;
  resource_type: string;
  name: string;
  capacity: number;
  current_location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'available' | 'deployed' | 'unavailable';
  capabilities: string[];
  created_at: string;
};
