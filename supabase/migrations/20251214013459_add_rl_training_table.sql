/*
  # Add RL Training Data Table
  
  Creates a table to persist action completion tracking and RL training metrics.
  
  ## New Tables
  
  ### rl_training_data
  Tracks completed actions for reinforcement learning optimization
  - `id` (uuid, primary key)
  - `action_id` (uuid, foreign key to priority_actions)
  - `disaster_id` (uuid, foreign key to disasters)
  - `action_type` (text) - Type of action: rescue, medical, logistics
  - `success` (boolean) - Whether action was successful
  - `completion_time` (timestamptz) - When action was completed
  - `initial_priority_score` (numeric) - Original RL priority score
  - `final_priority_score` (numeric) - Adjusted score after completion
  - `actual_impact` (integer) - Actual people helped
  - `estimated_impact` (integer) - Original estimate
  - `reward_score` (numeric) - RL reward calculation
  - `metadata` (jsonb) - Additional training data
  - `created_at` (timestamptz)
  
  ## Security
  - Enable RLS
  - Add policy for authenticated users to read training data
  - Add policy for system to write training data
*/

CREATE TABLE IF NOT EXISTS rl_training_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid REFERENCES priority_actions(id) ON DELETE CASCADE,
  disaster_id uuid REFERENCES disasters(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  success boolean DEFAULT true,
  completion_time timestamptz DEFAULT now(),
  initial_priority_score numeric DEFAULT 0,
  final_priority_score numeric DEFAULT 0,
  actual_impact integer DEFAULT 0,
  estimated_impact integer DEFAULT 0,
  reward_score numeric DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rl_training_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to rl training data"
  ON rl_training_data
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow insert for training data"
  ON rl_training_data
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_rl_training_action_id ON rl_training_data(action_id);
CREATE INDEX IF NOT EXISTS idx_rl_training_disaster_id ON rl_training_data(disaster_id);
CREATE INDEX IF NOT EXISTS idx_rl_training_action_type ON rl_training_data(action_type);
CREATE INDEX IF NOT EXISTS idx_rl_training_success ON rl_training_data(success);
CREATE INDEX IF NOT EXISTS idx_rl_training_created_at ON rl_training_data(created_at DESC);