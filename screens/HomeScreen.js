import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/homeStyles';
import CreatePostScreen from './CreatePostScreen';
import ReplyScreen from './ReplyScreen';
import QuotePostScreen from './QuotePostScreen';

export default function HomeScreen({ onLogout }) {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const styles = createStyles(theme);
  const [activeTab, setActiveTab] = useState('forYou');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    fetchUserProfile();
    fetchPosts();
    fetchLikedPosts();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserProfile(data);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts_with_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchLikedPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const likedPostIds = new Set(data.map(like => like.post_id));
      setLikedPosts(likedPostIds);
    } catch (error) {
      console.error('Error fetching liked posts:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    fetchPosts();
  };

  const handleReplyPress = (post) => {
    setSelectedPost(post);
    setShowReplyModal(true);
  };

  const handleReplyCreated = () => {
    setShowReplyModal(false);
    setSelectedPost(null);
    fetchPosts();
  };

  const handleRepostPress = (post) => {
    setSelectedPost(post);
    setShowRepostMenu(true);
  };

  const handleLikePress = async (post) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const isLiked = likedPosts.has(post.id);

      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);

        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(post.id);
          return newSet;
        });
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: post.id,
          });

        setLikedPosts(prev => new Set(prev).add(post.id));
      }

      // Update post count immediately
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === post.id 
            ? { ...p, likes_count: isLiked ? p.likes_count - 1 : p.likes_count + 1 }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Lỗi', 'Không thể like bài viết. Vui lòng thử lại.');
    }
  };

  const handleSharePress = async (post) => {
    try {
      const shareMessage = `${post.content}\n\n- ${post.display_name} (@${post.username})`;
      
      const result = await Share.share({
        message: shareMessage,
        title: 'Chia sẻ bài viết',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type
          console.log('Shared with activity type:', result.activityType);
        } else {
          // Shared
          console.log('Post shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      Alert.alert('Lỗi', 'Không thể chia sẻ bài viết.');
    }
  };

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const handleSimpleRepost = async () => {
    setShowRepostMenu(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if already reposted
      const { data: existing } = await supabase
        .from('retweets')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', selectedPost.id)
        .is('quote_content', null)
        .single();

      if (existing) {
        // Undo repost
        await supabase
          .from('retweets')
          .delete()
          .eq('id', existing.id);
        Alert.alert('Thành công', 'Đã hủy repost');
      } else {
        // Create repost
        await supabase
          .from('retweets')
          .insert({
            user_id: user.id,
            post_id: selectedPost.id,
          });
        Alert.alert('Thành công', 'Đã repost!');
      }
      
      fetchPosts();
    } catch (error) {
      console.error('Error reposting:', error);
      Alert.alert('Lỗi', 'Không thể repost. Vui lòng thử lại.');
    }
    setSelectedPost(null);
  };

  const handleQuotePress = () => {
    setShowRepostMenu(false);
    setShowQuoteModal(true);
  };

  const handleQuoteCreated = () => {
    setShowQuoteModal(false);
    setSelectedPost(null);
    fetchPosts();
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now - postTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    return `${diffDays} ngày`;
  };

  const renderPost = ({ item }) => (
    <View style={styles.post}>
      <Image 
        source={{ uri: item.avatar_url || 'https://i.pravatar.cc/150?u=' + item.user_id }} 
        style={styles.avatar} 
      />
      <View style={styles.postContent}>
        <View style={styles.postHeader}>
          <Text style={styles.authorName}>{item.display_name || 'User'}</Text>
          <Text style={styles.username}> @{item.username || 'user'}</Text>
          <Text style={styles.time}> • {formatTime(item.created_at)}</Text>
        </View>
        
        <Text style={styles.content}>{item.content}</Text>
        
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.postImage} />
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleReplyPress(item)}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{item.comments_count || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleRepostPress(item)}
          >
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>{item.retweets_count || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikePress(item)}
          >
            <View style={styles.iconContainer}>
              <Text style={[
                styles.actionIcon,
                likedPosts.has(item.id) ? styles.likedIcon : styles.unlikedIcon
              ]}>
                {likedPosts.has(item.id) ? '❤️' : '♡'}
              </Text>
            </View>
            <Text style={[
              styles.actionText,
              likedPosts.has(item.id) && styles.likedText
            ]}>
              {item.likes_count || 0}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSharePress(item)}
          >
            <Text style={styles.actionIcon}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d9bf0" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onLogout}>
          <Image
            source={{ uri: userProfile?.avatar_url || 'https://i.pravatar.cc/150?img=3' }}
            style={styles.headerAvatar}
          />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>X Clone</Text>
        
        <TouchableOpacity onPress={toggleTheme}>
          <Text style={styles.headerIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forYou' && styles.activeTab]}
          onPress={() => setActiveTab('forYou')}
        >
          <Text style={[styles.tabText, activeTab === 'forYou' && styles.activeTabText]}>
            Dành cho bạn
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.activeTabText]}>
            Đang theo dõi
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        style={styles.feed}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1d9bf0"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có bài đăng nào</Text>
            <Text style={styles.emptySubtext}>Hãy tạo bài đăng đầu tiên!</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowCreatePost(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={showCreatePost}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreatePost(false)}
      >
        <CreatePostScreen
          navigation={{ goBack: () => setShowCreatePost(false) }}
          onPostCreated={handlePostCreated}
        />
      </Modal>

      <Modal
        visible={showReplyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowReplyModal(false);
          setSelectedPost(null);
        }}
      >
        {selectedPost && (
          <ReplyScreen
            navigation={{ goBack: () => setShowReplyModal(false) }}
            route={{ post: selectedPost }}
            onReplyCreated={handleReplyCreated}
          />
        )}
      </Modal>

      <Modal
        visible={showQuoteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowQuoteModal(false);
          setSelectedPost(null);
        }}
      >
        {selectedPost && (
          <QuotePostScreen
            navigation={{ goBack: () => setShowQuoteModal(false) }}
            route={{ post: selectedPost }}
            onQuoteCreated={handleQuoteCreated}
          />
        )}
      </Modal>

      <Modal
        visible={showRepostMenu}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowRepostMenu(false);
          setSelectedPost(null);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowRepostMenu(false);
            setSelectedPost(null);
          }}
        >
          <View style={styles.repostMenu}>
            <TouchableOpacity 
              style={styles.repostMenuItem}
              onPress={handleSimpleRepost}
            >
              <Text style={styles.repostMenuIcon}>🔄</Text>
              <Text style={styles.repostMenuText}>Repost</Text>
            </TouchableOpacity>
            
            <View style={styles.repostMenuDivider} />
            
            <TouchableOpacity 
              style={styles.repostMenuItem}
              onPress={handleQuotePress}
            >
              <Text style={styles.repostMenuIcon}>✏️</Text>
              <Text style={styles.repostMenuText}>Quote</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconActive}>🏠</Text>
          <Text style={styles.navTextActive}>Trang chủ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navText}>Tìm kiếm</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🔔</Text>
          <Text style={styles.navText}>Thông báo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navText}>Hồ sơ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
