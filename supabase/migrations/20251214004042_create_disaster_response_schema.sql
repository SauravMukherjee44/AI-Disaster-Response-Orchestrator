/*
  # Disaster Response Orchestrator Schema

  ## Overview
  Creates the complete database structure for an AI-powered disaster response system
  that orchestrates rescue operations using Kestra workflows, Oumi RL, and Cline AI.

  ## New Tables

  ### 1. disasters
  Stores disaster events with location, severity, and status
  - `id` (uuid, primary key)
  - `title` (text) - Disaster name/title
  - `description` (text) - Initial disaster description
  - `disaster_type` (text) - Type: earthquake, flood, fire, hurricane, etc.
  - `severity` (text) - critical, high, medium, low
  - `latitude` (numeric) - Geographic coordinates
  - `longitude` (numeric)
  - `affected_population` (integer) - Estimated people affected
  - `status` (text) - active, responding, resolved
  - `metadata` (jsonb) - Additional disaster data
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. ai_summaries
  AI-generated situation reports and analysis
  - `id` (uuid, primary key)
  - `disaster_id` (uuid, foreign key)
  - `summary` (text) - AI-generated summary
  - `key_insights` (jsonb) - Structured insights array
  - `recommended_actions` (jsonb) - AI recommendations
  - `confidence_score` (numeric) - AI confidence 0-1
  - `model_used` (text) - AI model identifier
  - `created_at` (timestamptz)

  ### 3. priority_actions
  Actionable items prioritized by RL model
  - `id` (uuid, primary key)
  - `disaster_id` (uuid, foreign key)
  - `action_type` (text) - rescue, medical, logistics, communication
  - `description` (text) - Action description
  - `priority_score` (numeric) - RL-calculated priority 0-100
  - `status` (text) - pending, in_progress, completed, cancelled
  - `assigned_resources` (jsonb) - Allocated resources
  - `estimated_impact` (integer) - Expected people helped
  - `deadline` (timestamptz) - Time-critical deadline
  - `completed_at` (timestamptz)
  - `created_at` (timestamptz)

  ### 4. resources
  Available response resources (teams, supplies, equipment)
  - `id` (uuid, primary key)
  - `resource_type` (text) - rescue_team, medical_unit, supply_depot, vehicle
  - `name` (text) - Resource name
  - `capacity` (integer) - Max capacity/throughput
  - `current_location` (jsonb) - {lat, lng, address}
  - `status` (text) - available, deployed, unavailable
  - `capabilities` (jsonb) - Skills/equipment list
  - `created_at` (timestamptz)

  ### 5. resource_allocations
  RL-optimized resource assignments
  - `id` (uuid, primary key)
  - `action_id` (uuid, foreign key)
  - `resource_id` (uuid, foreign key)
  - `allocation_score` (numeric) - RL optimization score
  - `estimated_arrival` (timestamptz)
  - `status` (text) - assigned, en_route, arrived, completed
  - `created_at` (timestamptz)

  ### 6. rl_decisions
  Reinforcement learning decision logs for model training
  - `id` (uuid, primary key)
  - `disaster_id` (uuid, foreign key)
  - `state_snapshot` (jsonb) - System state at decision time
  - `action_taken` (jsonb) - Decision made by RL model
  - `reward` (numeric) - Outcome reward for training
  - `model_version` (text) - RL model version
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Public read access for dashboard viewing
  - Authenticated write access for system operations
*/

-- Create disasters table
CREATE TABLE IF NOT EXISTS disasters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  disaster_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  affected_population integer DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ai_summaries table
CREATE TABLE IF NOT EXISTS ai_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id uuid NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
  summary text NOT NULL,
  key_insights jsonb DEFAULT '[]'::jsonb,
  recommended_actions jsonb DEFAULT '[]'::jsonb,
  confidence_score numeric DEFAULT 0.0,
  model_used text DEFAULT 'unknown',
  created_at timestamptz DEFAULT now()
);

-- Create priority_actions table
CREATE TABLE IF NOT EXISTS priority_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id uuid NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  description text NOT NULL,
  priority_score numeric DEFAULT 50.0,
  status text NOT NULL DEFAULT 'pending',
  assigned_resources jsonb DEFAULT '[]'::jsonb,
  estimated_impact integer DEFAULT 0,
  deadline timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  name text NOT NULL,
  capacity integer DEFAULT 1,
  current_location jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'available',
  capabilities jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create resource_allocations table
CREATE TABLE IF NOT EXISTS resource_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL REFERENCES priority_actions(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  allocation_score numeric DEFAULT 0.0,
  estimated_arrival timestamptz,
  status text NOT NULL DEFAULT 'assigned',
  created_at timestamptz DEFAULT now()
);

-- Create rl_decisions table
CREATE TABLE IF NOT EXISTS rl_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disaster_id uuid NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
  state_snapshot jsonb NOT NULL,
  action_taken jsonb NOT NULL,
  reward numeric DEFAULT 0.0,
  model_version text DEFAULT 'v1.0',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_disasters_status ON disasters(status);
CREATE INDEX IF NOT EXISTS idx_disasters_severity ON disasters(severity);
CREATE INDEX IF NOT EXISTS idx_disasters_created_at ON disasters(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_disaster_id ON ai_summaries(disaster_id);
CREATE INDEX IF NOT EXISTS idx_priority_actions_disaster_id ON priority_actions(disaster_id);
CREATE INDEX IF NOT EXISTS idx_priority_actions_status ON priority_actions(status);
CREATE INDEX IF NOT EXISTS idx_priority_actions_priority_score ON priority_actions(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_action_id ON resource_allocations(action_id);
CREATE INDEX IF NOT EXISTS idx_rl_decisions_disaster_id ON rl_decisions(disaster_id);

-- Enable Row Level Security
ALTER TABLE disasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rl_decisions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for dashboard, authenticated write for system
CREATE POLICY "Public can view disasters"
  ON disasters FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert disasters"
  ON disasters FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update disasters"
  ON disasters FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view AI summaries"
  ON ai_summaries FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert AI summaries"
  ON ai_summaries FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Public can view priority actions"
  ON priority_actions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert priority actions"
  ON priority_actions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update priority actions"
  ON priority_actions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view resources"
  ON resources FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage resources"
  ON resources FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view resource allocations"
  ON resource_allocations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can manage allocations"
  ON resource_allocations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can view RL decisions"
  ON rl_decisions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can insert RL decisions"
  ON rl_decisions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for disasters table
CREATE TRIGGER update_disasters_updated_at
  BEFORE UPDATE ON disasters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample resources for demo
INSERT INTO resources (resource_type, name, capacity, current_location, status, capabilities) VALUES
  ('rescue_team', 'Alpha Rescue Squad', 8, '{"lat": 37.7749, "lng": -122.4194, "address": "San Francisco HQ"}'::jsonb, 'available', '["search_and_rescue", "medical_first_aid", "water_rescue"]'::jsonb),
  ('rescue_team', 'Bravo Rescue Squad', 6, '{"lat": 34.0522, "lng": -118.2437, "address": "Los Angeles Base"}'::jsonb, 'available', '["search_and_rescue", "mountain_rescue", "medical_first_aid"]'::jsonb),
  ('medical_unit', 'Mobile Hospital Unit 1', 20, '{"lat": 37.7749, "lng": -122.4194, "address": "SF Medical Center"}'::jsonb, 'available', '["emergency_surgery", "trauma_care", "triage"]'::jsonb),
  ('medical_unit', 'Field Medical Team', 10, '{"lat": 34.0522, "lng": -118.2437, "address": "LA General Hospital"}'::jsonb, 'available', '["trauma_care", "field_medicine", "evacuation"]'::jsonb),
  ('supply_depot', 'Emergency Supply Warehouse A', 1000, '{"lat": 37.8044, "lng": -122.2712, "address": "Oakland Warehouse"}'::jsonb, 'available', '["food", "water", "medical_supplies", "shelter"]'::jsonb),
  ('vehicle', 'Helicopter MedEvac 1', 4, '{"lat": 37.7749, "lng": -122.4194, "address": "SF Helipad"}'::jsonb, 'available', '["air_transport", "medical_evacuation", "aerial_survey"]'::jsonb),
  ('vehicle', 'Heavy Transport Truck 1', 2, '{"lat": 34.0522, "lng": -118.2437, "address": "LA Depot"}'::jsonb, 'available', '["ground_transport", "equipment_delivery", "supply_distribution"]'::jsonb)
ON CONFLICT DO NOTHING;
