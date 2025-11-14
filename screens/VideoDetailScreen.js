import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { useTheme } from '../contexts/ThemeContext';
import { youtubeService } from '../services/youtubeService';

const { width } = Dimensions.get('window');

export default function VideoDetailScreen({ navigation, route }) {
  const { videoId } = route.params;
  const { theme } = useTheme();
  const [videoDetails, setVideoDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchVideoDetails();
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      const details = await youtubeService.getVideoDetails([videoId]);
      if (details && details.length > 0) {
        setVideoDetails(details[0]);
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin video');
    } finally {
      setLoading(false);
    }
  };

  const onStateChange = useCallback((state) => {
    if (state === 'ended') {
      setPlaying(false);
    }
  }, []);

  const openInYouTube = () => {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    Linking.openURL(url);
  };

  const formatNumber = (num) => {
    return youtubeService.formatViewCount(parseInt(num));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Chi tiết video</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0000" />
        </View>
      </SafeAreaView>
    );
  }

  if (!videoDetails) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Chi tiết video</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>
            Không tìm thấy video
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          Video
        </Text>
        <TouchableOpacity onPress={openInYouTube} style={styles.youtubeButton}>
          <Ionicons name="logo-youtube" size={24} color="#FF0000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* YouTube Player */}
        <View style={styles.playerContainer}>
          <YoutubePlayer
            height={width * 9 / 16}
            play={playing}
            videoId={videoId}
            onChangeState={onStateChange}
            webViewProps={{
              allowsFullscreenVideo: false,
            }}
            initialPlayerParams={{
              controls: true,
              modestbranding: true,
              preventFullScreen: true,
            }}
          />
        </View>

        {/* Video Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.videoTitle, { color: theme.text }]}>
            {videoDetails.snippet?.title}
          </Text>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={18} color={theme.secondaryText} />
              <Text style={[styles.statText, { color: theme.secondaryText }]}>
                {formatNumber(videoDetails.statistics?.viewCount || 0)} lượt xem
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="thumbs-up-outline" size={18} color={theme.secondaryText} />
              <Text style={[styles.statText, { color: theme.secondaryText }]}>
                {formatNumber(videoDetails.statistics?.likeCount || 0)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={18} color={theme.secondaryText} />
              <Text style={[styles.statText, { color: theme.secondaryText }]}>
                {formatNumber(videoDetails.statistics?.commentCount || 0)}
              </Text>
            </View>
          </View>

          {/* Published Date */}
          <Text style={[styles.publishDate, { color: theme.secondaryText }]}>
            Đăng ngày: {formatDate(videoDetails.snippet?.publishedAt)}
          </Text>

          {/* Duration */}
          {videoDetails.contentDetails?.duration && (
            <View style={styles.durationContainer}>
              <Ionicons name="time-outline" size={18} color={theme.secondaryText} />
              <Text style={[styles.durationText, { color: theme.secondaryText }]}>
                Thời lượng: {youtubeService.formatDuration(videoDetails.contentDetails.duration)}
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={[styles.descriptionContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <TouchableOpacity 
              onPress={() => setShowDescription(!showDescription)}
              style={styles.descriptionHeader}
            >
              <Text style={[styles.descriptionTitle, { color: theme.text }]}>
                Mô tả
              </Text>
              <Ionicons 
                name={showDescription ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={theme.text} 
              />
            </TouchableOpacity>
            
            {showDescription && (
              <Text style={[styles.descriptionText, { color: theme.secondaryText }]}>
                {videoDetails.snippet?.description || 'Không có mô tả'}
              </Text>
            )}
          </View>

          {/* Tags */}
          {videoDetails.snippet?.tags && videoDetails.snippet.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={[styles.tagsTitle, { color: theme.text }]}>Tags:</Text>
              <View style={styles.tagsWrapper}>
                {videoDetails.snippet.tags.slice(0, 10).map((tag, index) => (
                  <View 
                    key={index} 
                    style={[styles.tag, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                  >
                    <Text style={[styles.tagText, { color: theme.secondaryText }]}>
                      #{tag}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#FF0000' }]}
              onPress={openInYouTube}
            >
              <Ionicons name="logo-youtube" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Xem trên YouTube</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 12,
  },
  youtubeButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  playerContainer: {
    width: width,
    height: width * 9 / 16,
    backgroundColor: '#000',
  },
  infoSection: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
  },
  publishDate: {
    fontSize: 14,
    marginBottom: 8,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  durationText: {
    fontSize: 14,
    marginLeft: 6,
  },
  descriptionContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
  },
  actionButtons: {
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
