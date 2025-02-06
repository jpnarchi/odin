/*
  # Initial Auth Schema

  1. New Tables
    - `user_preferences`
      - `user_id` (uuid, primary key)
      - `email_opt_in` (boolean)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on `user_preferences` table
    - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id),
  email_opt_in boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);