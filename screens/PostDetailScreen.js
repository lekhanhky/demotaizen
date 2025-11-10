import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function PostDetailScreen({ navigation, route }) {
  const { postId } = route.params;
  const { theme } = useTheme();
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());

  useEffect(() => {
    fetchPost();
    fetchReplies();
    fetchLikedPosts();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts_with_details')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      Alert.alert('Lỗi', 'Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('posts_with_details')
        .select('*')
        .eq('parent_post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
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

  const handleLikePress = async (item) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const isLiked = likedPosts.has(item.id);

      if (isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', item.id);

        setLikedPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.id);
          return newSet;
        });
      } else {
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: item.id,
          });

        setLikedPosts(prev => new Set(prev).add(item.id));
      }

      // Refresh to update counts
      if (item.id === postId) {
        fetchPost();
      } else {
        fetchReplies();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Lỗi', 'Không thể like bài viết');
    }
  };

  const handleSharePress = async (item) => {
    try {
      const shareMessage = `${item.content}\n\n- ${item.display_name} (@${item.username})`;
      
      await Share.share({
        message: shareMessage,
        title: 'Chia sẻ bài viết',
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPost();
    fetchReplies();
  };

  const styles = createStyles(theme);

  const renderReply = ({ item }) => (
    <TouchableOpacity 
      style={styles.replyItem}
      onPress={() => navigation.push('PostDetail', { postId: item.id })}
      activeOpacity={0.95}
    >
      <TouchableOpacity 
        onPress={() => navigation.navigate('Profile', { userId: item.user_id })}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.avatar_url || `https://i.pravatar.cc/150?u=${item.user_id}` }} 
          style={styles.avatar} 
        />
      </TouchableOpacity>
      <View style={styles.replyContent}>
        <View style={styles.replyHeader}>
          <Text style={styles.authorName}>{item.display_name || 'User'}</Text>
          <Text style={styles.username}> @{item.username || 'user'}</Text>
          <Text style={styles.time}> • {formatTime(item.created_at)}</Text>
        </View>
        
        <Text style={styles.content}>{item.content}</Text>
        
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.replyImage} />
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikePress(item)}
          >
            <Ionicons 
              name={likedPosts.has(item.id) ? "heart" : "heart-outline"} 
              size={18} 
              color={likedPosts.has(item.id) ? theme.likeColor : theme.iconColor} 
            />
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
            <Ionicons name="share-outline" size={18} color={theme.iconColor} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bài viết</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không tìm thấy bài viết</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài viết</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={replies}
        renderItem={renderReply}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.postDetail}>
            <TouchableOpacity 
              style={styles.postHeader}
              onPress={() => navigation.navigate('Profile', { userId: post.user_id })}
              activeOpacity={0.7}
            >
              <Image 
                source={{ uri: post.avatar_url || `https://i.pravatar.cc/150?u=${post.user_id}` }} 
                style={styles.largeAvatar} 
              />
              <View>
                <Text style={styles.authorName}>{post.display_name || 'User'}</Text>
                <Text style={styles.username}>@{post.username || 'user'}</Text>
              </View>
            </TouchableOpacity>
            
            <Text style={styles.postContent}>{post.content}</Text>
            
            {post.image_url && (
              <Image source={{ uri: post.image_url }} style={styles.postImage} />
            )}
            
            <Text style={styles.postTime}>{formatTime(post.created_at)}</Text>
            
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{post.retweets_count || 0}</Text>
                <Text style={styles.statLabel}> Repost</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{post.likes_count || 0}</Text>
                <Text style={styles.statLabel}> Thích</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{post.comments_count || 0}</Text>
                <Text style={styles.statLabel}> Bình luận</Text>
              </View>
            </View>
            
            <View style={styles.mainActions}>
              <TouchableOpacity 
                style={styles.mainActionButton}
                onPress={() => handleLikePress(post)}
              >
                <Ionicons 
                  name={likedPosts.has(post.id) ? "heart" : "heart-outline"} 
                  size={24} 
                  color={likedPosts.has(post.id) ? theme.likeColor : theme.iconColor} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mainActionButton}
                onPress={() => navigation.navigate('Reply', { postId: post.id })}
              >
                <Ionicons name="chatbubble-outline" size={24} color={theme.iconColor} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mainActionButton}
                onPress={() => handleSharePress(post)}
              >
                <Ionicons name="share-outline" size={24} color={theme.iconColor} />
              </TouchableOpacity>
            </View>
            
            {replies.length > 0 && (
              <View style={styles.repliesHeader}>
                <Text style={styles.repliesTitle}>Bình luận ({replies.length})</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          replies.length === 0 && (
            <View style={styles.emptyReplies}>
              <Text style={styles.emptyRepliesText}>Chưa có bình luận nào</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
  },
  postDetail: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: theme.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorName: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  username: {
    color: theme.secondaryText,
    fontSize: 15,
  },
  postContent: {
    color: theme.text,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: theme.secondaryBackground,
  },
  replyImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: theme.secondaryBackground,
  },
  postTime: {
    color: theme.secondaryText,
    fontSize: 15,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statNumber: {
    color: theme.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  statLabel: {
    color: theme.secondaryText,
    fontSize: 15,
  },
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
    marginTop: 4,
  },
  mainActionButton: {
    padding: 8,
    borderRadius: 20,
  },
  repliesHeader: {
    paddingTop: 16,
  },
  repliesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  replyItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  time: {
    color: theme.secondaryText,
    fontSize: 14,
  },
  content: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: theme.secondaryText,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  likedText: {
    color: theme.likeColor,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.secondaryText,
  },
  emptyReplies: {
    padding: 40,
    alignItems: 'center',
  },
  emptyRepliesText: {
    fontSize: 15,
    color: theme.secondaryText,
  },
});
