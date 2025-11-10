import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import EditProfileScreen from './EditProfileScreen';

export default function ProfileScreen({ navigation, route, onLogout }) {
  const { theme } = useTheme();
  const userId = route?.params?.userId; // userId của user muốn xem, null = xem profile của mình
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [stats, setStats] = useState({
    postsCount: 0,
    followersCount: 0,
    followingCount: 0,
  });

  useEffect(() => {
    fetchUserProfile();
    fetchUserPosts();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Xác định user ID cần xem (nếu không có userId thì xem profile của mình)
      const targetUserId = userId || user.id;
      setIsOwnProfile(targetUserId === user.id);

      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();
      
      setUserProfile(data);
      
      // Fetch stats
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', targetUserId);
      
      setStats({
        postsCount: postsCount || 0,
        followersCount: 0,
        followingCount: 0,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const targetUserId = userId || user.id;

      const { data, error } = await supabase
        .from('posts_with_details')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: onLogout 
        },
      ]
    );
  };

  const handleProfileUpdated = () => {
    setShowEditModal(false);
    fetchUserProfile();
    fetchUserPosts();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const styles = createStyles(theme);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {userProfile?.display_name || 'Profile'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.secondaryText }]}>
            {stats.postsCount} bài viết
          </Text>
        </View>
        {isOwnProfile && (
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        )}
        {!isOwnProfile && <View style={{ width: 24 }} />}
      </View>

      <ScrollView>
        <View style={[styles.coverPhoto, { backgroundColor: theme.primary }]} />
        
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: userProfile?.avatar_url || 'https://i.pravatar.cc/150?img=3' }}
            style={styles.avatar}
          />
          
          {isOwnProfile && (
            <TouchableOpacity 
              style={[styles.editButton, { borderColor: theme.border }]}
              onPress={() => setShowEditModal(true)}
            >
              <Text style={[styles.editButtonText, { color: theme.text }]}>Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          )}
          {!isOwnProfile && (
            <TouchableOpacity 
              style={[styles.followButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.followButtonText}>Theo dõi</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.displayName, { color: theme.text }]}>
            {userProfile?.display_name || 'User'}
          </Text>
          <Text style={[styles.username, { color: theme.secondaryText }]}>
            @{userProfile?.username || 'user'}
          </Text>

          {userProfile?.bio && (
            <Text style={[styles.bio, { color: theme.text }]}>
              {userProfile.bio}
            </Text>
          )}

          <View style={styles.joinDate}>
            <Ionicons name="calendar-outline" size={16} color={theme.secondaryText} />
            <Text style={[styles.joinDateText, { color: theme.secondaryText }]}>
              Tham gia {formatTime(userProfile?.created_at)}
            </Text>
          </View>

          <View style={styles.stats}>
            <TouchableOpacity style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {stats.followingCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                Đang theo dõi
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {stats.followersCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                Người theo dõi
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={[styles.tab, styles.activeTab, { borderBottomColor: theme.primary }]}>
            <Text style={[styles.tabText, { color: theme.text }]}>Bài viết</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={[styles.tabText, { color: theme.secondaryText }]}>Trả lời</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={[styles.tabText, { color: theme.secondaryText }]}>Thích</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postsContainer}>
          {userPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                Chưa có bài viết nào
              </Text>
            </View>
          ) : (
            userPosts.map((post) => (
              <View key={post.id} style={[styles.post, { borderBottomColor: theme.border }]}>
                <Text style={[styles.postContent, { color: theme.text }]}>
                  {post.content}
                </Text>
                {post.image_url && (
                  <Image source={{ uri: post.image_url }} style={styles.postImage} />
                )}
                <View style={styles.postStats}>
                  <View style={styles.postStat}>
                    <Ionicons name="chatbubble-outline" size={16} color={theme.secondaryText} />
                    <Text style={[styles.postStatText, { color: theme.secondaryText }]}>
                      {post.comments_count || 0}
                    </Text>
                  </View>
                  <View style={styles.postStat}>
                    <Ionicons name="repeat-outline" size={16} color={theme.secondaryText} />
                    <Text style={[styles.postStatText, { color: theme.secondaryText }]}>
                      {post.retweets_count || 0}
                    </Text>
                  </View>
                  <View style={styles.postStat}>
                    <Ionicons name="heart-outline" size={16} color={theme.secondaryText} />
                    <Text style={[styles.postStatText, { color: theme.secondaryText }]}>
                      {post.likes_count || 0}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <EditProfileScreen
          navigation={{ goBack: () => setShowEditModal(false) }}
          onProfileUpdated={handleProfileUpdated}
        />
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPhoto: {
    height: 150,
  },
  profileInfo: {
    padding: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: -40,
    borderWidth: 4,
    borderColor: '#fff',
  },
  editButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  followButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  username: {
    fontSize: 15,
    marginTop: 2,
  },
  bio: {
    fontSize: 15,
    lineHeight: 20,
    marginTop: 12,
  },
  joinDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  joinDateText: {
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    gap: 4,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
  },
  postsContainer: {
    paddingBottom: 20,
  },
  post: {
    padding: 16,
    borderBottomWidth: 1,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    gap: 40,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});
