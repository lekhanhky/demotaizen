-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all follows"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Create view for following feed (posts from users you follow)
CREATE OR REPLACE VIEW following_feed AS
SELECT 
  p.*,
  up.username,
  up.display_name,
  up.avatar_url,
  up.bio,
  (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
  (SELECT COUNT(*) FROM posts WHERE parent_post_id = p.id) as comments_count,
  (SELECT COUNT(*) FROM retweets WHERE post_id = p.id) as retweets_count
FROM posts p
INNER JOIN user_profiles up ON p.user_id = up.id
WHERE p.user_id IN (
  SELECT following_id 
  FROM follows 
  WHERE follower_id = auth.uid()
)
ORDER BY p.created_at DESC;

-- Grant permissions
GRANT SELECT ON following_feed TO authenticated;
