import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { Video } from 'expo-av';
import { supabase } from '../lib/supabase';
import { decode } from 'base64-arraybuffer';
import { useTheme } from '../contexts/ThemeContext';

export default function CreatePostScreen({ navigation, onPostCreated }) {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      setMedia(result.assets[0]);
    }
  };

  const removeMedia = () => {
    setMedia(null);
  };

  const uploadMedia = async (uri, userId) => {
    const fileExt = uri.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    const mimeType = media.type === 'video' ? 'video/mp4' : 'image/jpeg';
    
    // Đọc file dưới dạng base64 sử dụng legacy API
    const base64 = await readAsStringAsync(uri, {
      encoding: 'base64',
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    const { error } = await supabase.storage
      .from('media')
      .upload(fileName, arrayBuffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung bài đăng');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      let mediaUrl = null;
      if (media) {
        setUploadProgress(50);
        mediaUrl = await uploadMedia(media.uri, user.id);
        setUploadProgress(100);
      }

      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            image_url: mediaUrl,
          }
        ]);

      if (error) throw error;

      Alert.alert('Thành công', 'Đã đăng bài thành công!');
      setContent('');
      setMedia(null);
      setUploadProgress(0);
      if (onPostCreated) onPostCreated();
      if (navigation) navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (navigation) {
      navigation.goBack();
    }
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={28} color={theme.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.postButton, !content.trim() && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.postButtonText}>Đăng</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor={theme.placeholderText}
            value={content}
            onChangeText={setContent}
            multiline
            autoFocus
            maxLength={280}
          />

          {media && (
            <View style={styles.mediaContainer}>
              {media.type === 'video' ? (
                <Video
                  source={{ uri: media.uri }}
                  style={styles.mediaPreview}
                  useNativeControls
                  resizeMode="contain"
                />
              ) : (
                <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
              )}
              <TouchableOpacity style={styles.removeButton} onPress={removeMedia}>
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && uploadProgress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
            </View>
          )}
          
          <View style={styles.footer}>
            <TouchableOpacity style={styles.mediaButton} onPress={pickMedia}>
              <Ionicons name="image-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={styles.mediaButtonText}>Ảnh/Video</Text>
            </TouchableOpacity>
            
            <Text style={styles.charCount}>
              {content.length}/280
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
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.headerBackground,
  },
  postButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  input: {
    color: theme.text,
    fontSize: 18,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  mediaContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: theme.secondaryBackground,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    marginBottom: 16,
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
    marginTop: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.secondaryBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  mediaButtonText: {
    color: theme.text,
    fontSize: 14,
  },
  charCount: {
    color: theme.secondaryText,
    fontSize: 13,
  },
});
