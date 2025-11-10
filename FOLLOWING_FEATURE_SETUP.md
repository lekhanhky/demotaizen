# Hướng dẫn cài đặt chức năng "Đang theo dõi"

## Tổng quan
Chức năng này cho phép người dùng:
- Theo dõi người dùng khác
- Xem bài đăng từ những người họ theo dõi trong tab "Đang theo dõi"
- Chuyển đổi giữa feed "Dành cho bạn" (tất cả bài đăng) và "Đang theo dõi"

## Bước 1: Chạy Migration SQL

Chạy file migration trong Supabase SQL Editor:

```bash
supabase-migrations/create_follows_system.sql
```

Hoặc copy nội dung file và chạy trực tiếp trong Supabase Dashboard > SQL Editor.

Migration này sẽ tạo:
- Bảng `follows` để lưu quan hệ theo dõi
- View `following_feed` để lấy bài đăng từ người dùng đang theo dõi
- Indexes để tối ưu hiệu suất
- RLS policies để bảo mật

## Bước 2: Cập nhật ProfileScreen

Thêm nút Follow/Unfollow vào ProfileScreen để người dùng có thể theo dõi nhau.

### Thêm state và logic follow:

```javascript
const [isFollowing, setIsFollowing] = useState(false);
const [followersCount, setFollowersCount] = useState(0);
const [followingCount, setFollowingCount] = useState(0);

// Kiểm tra trạng thái follow
const checkFollowStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !userId) return;

    const { data, error } = await supabase
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
      // Unfollow
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      
      setIsFollowing(false);
      setFollowersCount(prev => prev - 1);
    } else {
      // Follow
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
    Alert.alert('Lỗi', 'Không thể thực hiện. Vui lòng thử lại.');
  }
};
```

### Thêm nút Follow trong UI:

```javascript
{!isOwnProfile && (
  <TouchableOpacity
    style={[styles.followButton, isFollowing && styles.followingButton]}
    onPress={handleFollowToggle}
  >
    <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
      {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
    </Text>
  </TouchableOpacity>
)}

<View style={styles.statsContainer}>
  <TouchableOpacity style={styles.statItem}>
    <Text style={styles.statNumber}>{followingCount}</Text>
    <Text style={styles.statLabel}>Đang theo dõi</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.statItem}>
    <Text style={styles.statNumber}>{followersCount}</Text>
    <Text style={styles.statLabel}>Người theo dõi</Text>
  </TouchableOpacity>
</View>
```

## Bước 3: Test chức năng

1. Đăng nhập với 2 tài khoản khác nhau
2. Tài khoản A theo dõi tài khoản B
3. Tài khoản B tạo bài đăng mới
4. Tài khoản A chuyển sang tab "Đang theo dõi" và sẽ thấy bài đăng của B
5. Tab "Dành cho bạn" vẫn hiển thị tất cả bài đăng

## Cấu trúc Database

### Bảng `follows`
- `id`: UUID (Primary Key)
- `follower_id`: UUID (người theo dõi)
- `following_id`: UUID (người được theo dõi)
- `created_at`: Timestamp

### View `following_feed`
Tự động lọc bài đăng từ những người mà user hiện tại đang theo dõi.

## Tính năng đã triển khai

✅ Tab "Đang theo dõi" hiển thị bài đăng từ người dùng đang theo dõi
✅ Tab "Dành cho bạn" hiển thị tất cả bài đăng
✅ Chuyển đổi mượt mà giữa các tab
✅ Tự động refresh khi chuyển tab
✅ Hiển thị thông báo phù hợp khi không có bài đăng
✅ Tối ưu hiệu suất với indexes và view

## Lưu ý

- View `following_feed` sử dụng `auth.uid()` nên chỉ hoạt động với authenticated users
- RLS policies đảm bảo users chỉ có thể follow/unfollow với tài khoản của mình
- Không thể tự theo dõi chính mình (CHECK constraint)
- Mỗi cặp follower-following là duy nhất (UNIQUE constraint)
