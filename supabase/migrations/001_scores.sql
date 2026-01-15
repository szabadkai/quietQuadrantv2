-- Scores table for leaderboard
-- Fixed: Using trigger instead of generated column since EXTRACT is not immutable

CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  wave INTEGER NOT NULL,
  duration INTEGER NOT NULL,
  kills INTEGER NOT NULL,
  victory BOOLEAN DEFAULT FALSE,
  weekly_seed TEXT,
  affix_id TEXT,
  checksum TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  week_number INTEGER NOT NULL DEFAULT 0
);

-- Function to calculate week_number on insert
CREATE OR REPLACE FUNCTION set_week_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.week_number := EXTRACT(ISOYEAR FROM NEW.created_at)::INTEGER * 100 + EXTRACT(WEEK FROM NEW.created_at)::INTEGER;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set week_number
CREATE TRIGGER trigger_set_week_number
  BEFORE INSERT ON scores
  FOR EACH ROW
  EXECUTE FUNCTION set_week_number();

-- Indexes for efficient queries
CREATE INDEX idx_scores_created_at ON scores (created_at DESC);
CREATE INDEX idx_scores_score ON scores (score DESC);
CREATE INDEX idx_scores_weekly ON scores (week_number, score DESC);
CREATE INDEX idx_scores_weekly_seed ON scores (weekly_seed, score DESC);

-- Row Level Security
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Anyone can read scores
CREATE POLICY "Scores are viewable by everyone" ON scores
  FOR SELECT USING (true);

-- Scores can only be inserted via authenticated service role (edge functions)
-- Direct inserts from anon key are blocked
CREATE POLICY "Scores require service role for insert" ON scores
  FOR INSERT WITH CHECK (false);
