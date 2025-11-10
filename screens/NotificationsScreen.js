import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function NotificationsScreen({ navigation, onOpenPost }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications_with_details')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = async (notification) => {
    await markAsRead(notification.id);
    if (notification.post_id) {
      onOpenPost(notification.post_id);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return notifTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const getNotificationText = (notification) => {
    switch (notification.type) {
      case 'comment':
        return 'đã bình luận về bài viết của bạn';
      case 'like':
        return 'đã thích bài viết của bạn';
      case 'retweet':
        return 'đã repost bài viết của bạn';
      default:
        return 'có hoạt động mới';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return { name: 'chatbubble', color: theme.primary };
      case 'like':
        return { name: 'heart', color: '#f91880' };
      case 'retweet':
        return { name: 'repeat', color: '#00ba7c' };
      default:
        return { name: 'notifications', color: theme.primary };
    }
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          !item.is_read && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <Image
          source={{ uri: item.actor_avatar_url || `https://i.pravatar.cc/150?u=${item.actor_id}` }}
          style={styles.avatar}
        />
        
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={[styles.iconBadge, { backgroundColor: icon.color }]}>
              <Ionicons name={icon.name} size={12} color="#fff" />
            </View>
          </View>
          
          <Text style={styles.notificationText}>
            <Text style={styles.actorName}>{item.actor_display_name}</Text>
            {' '}
            <Text style={styles.actionText}>{getNotificationText(item)}</Text>
          </Text>
          
          {item.content && (
            <Text style={styles.contentPreview} numberOfLines={2}>
              {item.content}
            </Text>
          )}
          
          {item.post_content && (
            <View style={styles.postPreview}>
              <Text style={styles.postPreviewText} numberOfLines={2}>
                {item.post_content}
              </Text>
            </View>
          )}
          
          <Text style={styles.time}>{formatTime(item.created_at)}</Text>
        </View>
        
        {!item.is_read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 24 }} />}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color={theme.iconColor} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyText}>Chưa có thông báo</Text>
            <Text style={styles.emptySubtext}>Các thông báo sẽ hiển thị ở đây</Text>
          </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  markAllRead: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  unreadNotification: {
    backgroundColor: theme.secondaryBackground,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  actorName: {
    fontWeight: '700',
    color: theme.text,
  },
  actionText: {
    color: theme.text,
  },
  contentPreview: {
    fontSize: 14,
    color: theme.secondaryText,
    marginTop: 4,
    marginBottom: 4,
  },
  postPreview: {
    marginTop: 8,
    padding: 12,
    backgroundColor: theme.inputBackground,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: theme.primary,
  },
  postPreviewText: {
    fontSize: 14,
    color: theme.text,
  },
  time: {
    fontSize: 13,
    color: theme.secondaryText,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    marginLeft: 8,
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 15,
    color: theme.secondaryText,
    marginTop: 8,
  },
});
