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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function QuotePostScreen({ navigation, route, onQuoteCreated }) {
  const { post } = route || {};
  const { theme } = useTheme();
  const [quoteContent, setQuoteContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchUserProfile();
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

  const handleQuote = async () => {
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
        .from('retweets')
        .insert({
          user_id: user.id,
          post_id: post.id,
          quote_content: quoteContent.trim() || null,
          quote_image_url: imageUrl,
        });

      if (error) throw error;

      Alert.alert('Thành công', 'Đã quote post!');
      if (onQuoteCreated) onQuoteCreated();
      if (navigation?.goBack) navigation.goBack();
    } catch (error) {
      console.error('Error creating quote:', error);
      Alert.alert('Lỗi', 'Không thể tạo quote. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quote Post</Text>
          <TouchableOpacity
            onPress={handleQuote}
            disabled={loading}
            style={[styles.postButton, loading && styles.postButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.postButtonText}>Đăng</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.inputSection}>
            <Image
              source={{ uri: userProfile?.avatar_url || 'https://i.pravatar.cc/150?img=3' }}
              style={styles.avatar}
            />
            <TextInput
              style={styles.input}
              placeholder="Thêm bình luận của bạn"
              placeholderTextColor={theme.placeholderText}
              multiline
              value={quoteContent}
              onChangeText={setQuoteContent}
              maxLength={280}
              autoFocus
            />
          </View>

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

          <View style={styles.quotedPost}>
            <View style={styles.postHeader}>
              <Image
                source={{ uri: post?.avatar_url || 'https://i.pravatar.cc/150?u=' + post?.user_id }}
                style={styles.quotedAvatar}
              />
              <View>
                <View style={styles.authorRow}>
                  <Text style={styles.authorName}>{post?.display_name || 'User'}</Text>
                  <Text style={styles.username}> @{post?.username || 'user'}</Text>
                  <Text style={styles.time}> • {formatTime(post?.created_at)}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.quotedContent}>{post?.content}</Text>
            {post?.image_url && (
              <Image source={{ uri: post.image_url }} style={styles.quotedImage} />
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
            <Text style={styles.charCount}>
              {quoteContent.length}/280
            </Text>
          </View>
        </ScrollView>
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
  postButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  inputSection: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    position: 'relative',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: theme.secondaryBackground,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
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
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.primary,
  },
  quotedPost: {
    margin: 16,
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    backgroundColor: theme.secondaryBackground,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quotedAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    color: theme.text,
    fontWeight: 'bold',
    fontSize: 13,
  },
  username: {
    color: theme.secondaryText,
    fontSize: 13,
  },
  time: {
    color: theme.secondaryText,
    fontSize: 13,
  },
  quotedContent: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 8,
  },
  quotedImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: theme.secondaryBackground,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  imageButton: {
    padding: 4,
  },
  charCount: {
    color: theme.secondaryText,
    fontSize: 14,
  },
});
