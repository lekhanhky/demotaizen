# Hướng dẫn nhanh: Thêm nút Follow vào ProfileScreen

## Bước 1: Thêm state vào ProfileScreen

```javascript
const [isFollowing, setIsFollowing] = useState(false);
const [followersCount, setFollowersCount] = useState(0);
const [followingCount, setFollowingCount] = useState(0);
```

## Bước 2: Thêm functions

```javascript
// Kiểm tra trạng thái follow
const checkFollowStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !userId) return;

    const { data } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    setIsFollowing(!!data);
  } catch (error) {
    console.error('Error checking follow status:', error);
  }
};

// Lấy số lượng followers/following
const fetchFollowCounts = async () => {
  try {
    const [followersResult, followingResult] = await Promise.all([
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', userId),
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', userId)
    ]);

    setFollowersCount(followersResult.count || 0);
    setFollowingCount(followingResult.count || 0);
  } catch (error) {
    console.error('Error fetching follow counts:', error);
  }
};

// Toggle follow/unfollow
const handleFollowToggle = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isFollowing) {
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
    } else {
      await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });
      
      setIsFollowing(true);
      setFollowersCount(prev => prev + 1);
    }
  } catch (error) {
    console.error('Error toggling follow:', error);
  }
};
```

## Bước 3: Gọi functions trong useEffect

```javascript
useEffect(() => {
  if (userId) {
    checkFollowStatus();
    fetchFollowCounts();
  }
}, [userId]);
```

## Bước 4: Thêm UI

```javascript
{!isOwnProfile && (
  <TouchableOpacity
    style={[styles.followButton, isFollowing && styles.followingButton]}
    onPress={handleFollowToggle}
  >
    <Text style={styles.followButtonText}>
      {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
    </Text>
  </TouchableOpacity>
)}

<View style={styles.statsRow}>
  <Text style={styles.statText}>{followingCount} Đang theo dõi</Text>
  <Text style={styles.statText}>{followersCount} Người theo dõi</Text>
</View>
```

✅ Migration đã chạy thành công!
✅ Tab "Đang theo dõi" đã hoạt động!
