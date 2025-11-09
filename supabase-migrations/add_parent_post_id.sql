-- Add parent_post_id column to posts table for reply functionality
ALTER TABLE posts 
ADD COLUMN parent_post_id UUID REFERENCES posts(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX idx_posts_parent_post_id ON posts(parent_post_id);

-- Update the posts_with_details view to include reply information
DROP VIEW IF EXISTS posts_with_details;

CREATE VIEW posts_with_details AS
SELECT 
  p.id,
  p.user_id,
  p.content,
  p.image_url,
  p.created_at,
  p.parent_post_id,
  up.username,
  up.display_name,
  up.avatar_url,
  (SELECT COUNT(*) FROM posts WHERE parent_post_id = p.id) as comments_count,
  0 as retweets_count,
  0 as likes_count
FROM posts p
LEFT JOIN user_profiles up ON p.user_id = up.id
ORDER BY p.created_at DESC;
