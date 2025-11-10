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
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/homeStyles';
import CreatePostScreen from './CreatePostScreen';
import ReplyScreen from './ReplyScreen';
import QuotePostScreen from './QuotePostScreen';
import ProfileScreen from './ProfileScreen';
import MessagesScreen from './MessagesScreen';
import ChatScreen from './ChatScreen';
import NewMessageScreen from './NewMessageScreen';
import NotificationsScreen from './NotificationsScreen';
import PostDetailScreen from './PostDetailScreen';
import YouTubeScreen from './YouTubeScreen';

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [chatParams, setChatParams] = useState(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showPostDetailModal, setShowPostDetailModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);

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

  const fetchPosts = async (tab = activeTab) => {
    try {
      let query;
      
      if (tab === 'following') {
        // Fetch posts from users you follow
        query = supabase
          .from('following_feed')
          .select('*')
          .order('created_at', { ascending: false });
      } else {
        // Fetch all posts (For You feed)
        query = supabase
          .from('posts_with_details')
          .select('*')
          .order('created_at', { ascending: false });
      }

      const { data, error } = await query;

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

  const fetchUnreadMessagesCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('conversations_with_details')
        .select('unread_count')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const totalUnread = data?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0;
      setUnreadMessagesCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const fetchUnreadNotificationsCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadNotificationsCount(count || 0);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchPosts(activeTab);
    fetchLikedPosts();
    fetchUnreadMessagesCount();
    fetchUnreadNotificationsCount();

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel('messages_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchUnreadMessagesCount()
      )
      .subscribe();

    // Subscribe to new notifications
    const notificationsSubscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => fetchUnreadNotificationsCount()
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
      notificationsSubscription.unsubscribe();
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(activeTab);
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    fetchPosts(activeTab);
  };

  const handleReplyPress = (post) => {
    setSelectedPost(post);
    setShowReplyModal(true);
  };

  const handleReplyCreated = () => {
    setShowReplyModal(false);
    setSelectedPost(null);
    fetchPosts(activeTab);
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
      
      fetchPosts(activeTab);
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
    fetchPosts(activeTab);
  };

  const handleOpenChat = (conversationId, otherUser) => {
    setChatParams({ conversationId, otherUser });
    setShowMessagesModal(false);
    setShowNewMessageModal(false);
    setShowChatModal(true);
  };

  const handleOpenNewMessage = () => {
    setShowMessagesModal(false);
    setShowNewMessageModal(true);
  };

  const handleOpenPost = (postId) => {
    setShowNotificationsModal(false);
    setSelectedPostId(postId);
    setShowPostDetailModal(true);
  };

  const handleOpenUserProfile = (userId) => {
    setSelectedUserId(userId);
    setShowProfileModal(true);
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
      <TouchableOpacity onPress={() => handleOpenUserProfile(item.user_id)}>
        <Image 
          source={{ uri: item.avatar_url || 'https://i.pravatar.cc/150?u=' + item.user_id }} 
          style={styles.avatar} 
        />
      </TouchableOpacity>
      <View style={styles.postContent}>
        <TouchableOpacity 
          style={styles.postHeader}
          onPress={() => handleOpenUserProfile(item.user_id)}
          activeOpacity={0.7}
        >
          <Text style={styles.authorName}>{item.display_name || 'User'}</Text>
          <Text style={styles.username}> @{item.username || 'user'}</Text>
          <Text style={styles.time}> • {formatTime(item.created_at)}</Text>
        </TouchableOpacity>
        
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
        <Text style={styles.headerTitle}>X Clone</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleTheme} style={styles.headerButton}>
            <Text style={styles.headerIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onLogout} style={styles.headerButton}>
            <Ionicons name="log-out-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forYou' && styles.activeTab]}
          onPress={() => {
            setActiveTab('forYou');
            setLoading(true);
            fetchPosts('forYou');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'forYou' && styles.activeTabText]}>
            Dành cho bạn
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'following' && styles.activeTab]}
          onPress={() => {
            setActiveTab('following');
            setLoading(true);
            fetchPosts('following');
          }}
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
            <Text style={styles.emptyText}>
              {activeTab === 'following' 
                ? 'Chưa có bài đăng từ người bạn theo dõi' 
                : 'Chưa có bài đăng nào'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'following'
                ? 'Hãy theo dõi người dùng để xem bài đăng của họ!'
                : 'Hãy tạo bài đăng đầu tiên!'}
            </Text>
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

      <Modal
        visible={showProfileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowProfileModal(false);
          setSelectedUserId(null);
        }}
      >
        <ProfileScreen
          navigation={{ goBack: () => {
            setShowProfileModal(false);
            setSelectedUserId(null);
          }}}
          route={{ params: { userId: selectedUserId } }}
          onLogout={() => {
            setShowProfileModal(false);
            setSelectedUserId(null);
            onLogout();
          }}
        />
      </Modal>

      <Modal
        visible={showMessagesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMessagesModal(false)}
      >
        <MessagesScreen
          navigation={{ goBack: () => setShowMessagesModal(false) }}
          onOpenChat={handleOpenChat}
          onOpenNewMessage={handleOpenNewMessage}
        />
      </Modal>

      <Modal
        visible={showChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowChatModal(false);
          setChatParams(null);
        }}
      >
        {chatParams && (
          <ChatScreen
            navigation={{ 
              goBack: () => {
                setShowChatModal(false);
                setChatParams(null);
                setShowMessagesModal(true);
              }
            }}
            route={{ params: chatParams }}
          />
        )}
      </Modal>

      <Modal
        visible={showNewMessageModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewMessageModal(false)}
      >
        <NewMessageScreen
          navigation={{ 
            goBack: () => {
              setShowNewMessageModal(false);
              setShowMessagesModal(true);
            }
          }}
          onStartChat={handleOpenChat}
        />
      </Modal>

      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <NotificationsScreen
          navigation={{ goBack: () => setShowNotificationsModal(false) }}
          onOpenPost={handleOpenPost}
        />
      </Modal>

      <Modal
        visible={showPostDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPostDetailModal(false)}
      >
        <PostDetailScreen
          navigation={{ goBack: () => setShowPostDetailModal(false) }}
          route={{ params: { postId: selectedPostId } }}
        />
      </Modal>

      <Modal
        visible={showYouTubeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowYouTubeModal(false)}
      >
        <YouTubeScreen
          navigation={{ goBack: () => setShowYouTubeModal(false) }}
        />
      </Modal>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={theme.primary} />
          <Text style={styles.navTextActive}>Trang chủ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setShowYouTubeModal(true)}
        >
          <Ionicons name="logo-youtube" size={24} color={theme.iconColor} style={{ opacity: 0.6 }} />
          <Text style={styles.navText}>Youtube</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setShowMessagesModal(true)}
        >
          <View style={styles.iconWithBadge}>
            <Ionicons name="mail-outline" size={24} color={theme.iconColor} style={{ opacity: 0.6 }} />
            {unreadMessagesCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Tin nhắn</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setShowNotificationsModal(true)}
        >
          <View style={styles.iconWithBadge}>
            <Ionicons name="notifications-outline" size={24} color={theme.iconColor} style={{ opacity: 0.6 }} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Thông báo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setShowProfileModal(true)}
        >
          {userProfile?.avatar_url ? (
            <Image 
              source={{ uri: userProfile.avatar_url }} 
              style={styles.navAvatar}
            />
          ) : (
            <Ionicons name="person-outline" size={24} color={theme.iconColor} style={{ opacity: 0.6 }} />
          )}
          <Text style={styles.navText}>
            {userProfile?.display_name || 'Hồ sơ'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
