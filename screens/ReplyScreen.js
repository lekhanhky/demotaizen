import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  FlatList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function ReplyScreen({ navigation, route, onReplyCreated }) {
  const { post } = route || {};
  const { theme } = useTheme();
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchUserProfile();
    fetchReplies();
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

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from('posts_with_details')
        .select('*')
        .eq('parent_post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
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

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const uploadImage = async (uri, userId) => {
    const fileExt = uri.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const base64 = await readAsStringAsync(uri, {
      encoding: 'base64',
    });

    const arrayBuffer = decode(base64);

    const { error } = await supabase.storage
      .from('media')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung reply');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let imageUrl = null;
      if (selectedImage) {
        setUploadProgress(50);
        imageUrl = await uploadImage(selectedImage.uri, user.id);
        setUploadProgress(100);
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: replyContent.trim(),
          parent_post_id: post.id,
          image_url: imageUrl,
        });

      if (error) throw error;

      setReplyContent('');
      setSelectedImage(null);
      setUploadProgress(0);
      fetchReplies();
      Alert.alert('Thành công', 'Đã reply bài viết!');
    } catch (error) {
      console.error('Error creating reply:', error);
      Alert.alert('Lỗi', 'Không thể tạo reply. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme);

  const renderReply = ({ item }) => (
    <View style={styles.replyItem}>
      <Image
        source={{ uri: item.avatar_url || 'https://i.pravatar.cc/150?u=' + item.user_id }}
        style={styles.replyAvatar}
      />
      <View style={styles.replyContent}>
        <View style={styles.replyHeader}>
          <Text style={styles.replyAuthorName}>{item.display_name || 'User'}</Text>
          <Text style={styles.replyUsername}> @{item.username || 'user'}</Text>
          <Text style={styles.replyTime}> • {formatTime(item.created_at)}</Text>
        </View>
        <Text style={styles.replyText}>{item.content}</Text>
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.replyImage} />
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (onReplyCreated) onReplyCreated();
          if (navigation?.goBack) navigation.goBack();
        }}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bài viết</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.originalPost}>
            <View style={styles.postHeader}>
              <Image
                source={{ uri: post?.avatar_url || 'https://i.pravatar.cc/150?u=' + post?.user_id }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.authorName}>{post?.display_name || 'User'}</Text>
                <Text style={styles.username}>@{post?.username || 'user'}</Text>
              </View>
            </View>
            <Text style={styles.originalContent}>{post?.content}</Text>
            {post?.image_url && (
              <Image source={{ uri: post.image_url }} style={styles.postImage} />
            )}
            <Text style={styles.replyingTo}>
              Đang reply cho <Text style={styles.replyingToUsername}>@{post?.username || 'user'}</Text>
            </Text>
          </View>

          {loadingReplies ? (
            <View style={styles.loadingReplies}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : replies.length > 0 ? (
            <View style={styles.repliesList}>
              <Text style={styles.repliesTitle}>Replies ({replies.length})</Text>
              {replies.map((reply) => (
                <View key={reply.id}>
                  {renderReply({ item: reply })}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noReplies}>
              <Text style={styles.noRepliesText}>Chưa có reply nào</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.replyInputContainer}>
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && uploadProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
            </View>
          )}

          <View style={styles.replySection}>
            <Image
              source={{ uri: userProfile?.avatar_url || 'https://i.pravatar.cc/150?img=3' }}
              style={styles.smallAvatar}
            />
            <TextInput
              style={styles.input}
              placeholder="Viết reply của bạn"
              placeholderTextColor={theme.placeholderText}
              multiline
              value={replyContent}
              onChangeText={setReplyContent}
              maxLength={280}
            />
          </View>
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color={theme.primary} />
              </TouchableOpacity>
              <Text style={styles.charCount}>
                {replyContent.length}/280
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleReply}
              disabled={loading || !replyContent.trim()}
              style={[
                styles.sendButton,
                (!replyContent.trim() || loading) && styles.sendButtonDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.sendButtonText}>Reply</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.headerBackground,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  scrollView: {
    flex: 1,
  },
  originalPost: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorName: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  username: {
    color: theme.secondaryText,
    fontSize: 14,
  },
  originalContent: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 60,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginLeft: 60,
    marginBottom: 12,
    backgroundColor: theme.secondaryBackground,
  },
  replyingTo: {
    color: theme.secondaryText,
    fontSize: 14,
    marginLeft: 60,
    marginTop: 8,
  },
  replyingToUsername: {
    color: theme.primary,
  },
  loadingReplies: {
    padding: 20,
    alignItems: 'center',
  },
  repliesList: {
    borderTopWidth: 8,
    borderTopColor: theme.border,
  },
  repliesTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  replyItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
  },
  replyAvatar: {
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
  replyAuthorName: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  replyUsername: {
    color: theme.secondaryText,
    fontSize: 14,
  },
  replyTime: {
    color: theme.secondaryText,
    fontSize: 14,
  },
  replyText: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  replyImage: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: theme.secondaryBackground,
  },
  noReplies: {
    padding: 40,
    alignItems: 'center',
  },
  noRepliesText: {
    color: theme.secondaryText,
    fontSize: 15,
  },
  replyInputContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.background,
  },
  replySection: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    maxHeight: 100,
  },
  imagePreviewContainer: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    backgroundColor: theme.secondaryBackground,
  },
  removeImageButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 3,
    backgroundColor: theme.border,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageButton: {
    padding: 4,
  },
  charCount: {
    color: theme.secondaryText,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
