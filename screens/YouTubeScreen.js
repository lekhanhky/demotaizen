import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { youtubeService } from '../services/youtubeService';
import { testYouTubeAPI } from '../utils/testYouTubeAPI';
import VideoDetailScreen from './VideoDetailScreen';
import { StyleSheet } from 'react-native';

export default function YouTubeScreen({ navigation }) {
  const { theme } = useTheme();
  const [videos, setVideos] = useState([]);
  const [channelInfo, setChannelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [showVideoDetail, setShowVideoDetail] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  useEffect(() => {
    // Chạy test API trước
    testYouTubeAPI();
    // Sau đó fetch data
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [channelData, videosData] = await Promise.all([
        youtubeService.getChannelInfo(),
        youtubeService.getChannelVideos(),
      ]);

      console.log('Channel Info:', channelData?.snippet?.title);
      console.log('Videos fetched:', videosData.videos.length);
      console.log('Total videos in channel:', videosData.totalResults);

      setChannelInfo(channelData);
      
      // Lấy thông tin chi tiết cho videos
      const videoIds = videosData.videos.map(v => v.id.videoId);
      console.log('Video IDs:', videoIds);
      
      const videoDetails = await youtubeService.getVideoDetails(videoIds);
      console.log('Video details fetched:', videoDetails.length);
      
      // Merge data
      const enrichedVideos = videosData.videos.map(video => {
        const details = videoDetails.find(d => d.id === video.id.videoId);
        return {
          ...video,
          statistics: details?.statistics,
          contentDetails: details?.contentDetails,
        };
      });

      console.log('Enriched videos:', enrichedVideos.length);
      setVideos(enrichedVideos);
      setNextPageToken(videosData.nextPageToken);
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      console.error('Error message:', error.message);
      Alert.alert('Lỗi', `Không thể tải dữ liệu YouTube: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreVideos = async () => {
    if (!nextPageToken || loadingMore) return;

    try {
      setLoadingMore(true);
      const videosData = await youtubeService.getChannelVideos(nextPageToken);
      
      const videoIds = videosData.videos.map(v => v.id.videoId);
      const videoDetails = await youtubeService.getVideoDetails(videoIds);
      
      const enrichedVideos = videosData.videos.map(video => {
        const details = videoDetails.find(d => d.id === video.id.videoId);
        return {
          ...video,
          statistics: details?.statistics,
          contentDetails: details?.contentDetails,
        };
      });

      setVideos(prev => [...prev, ...enrichedVideos]);
      setNextPageToken(videosData.nextPageToken);
    } catch (error) {
      console.error('Error loading more videos:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInitialData();
  };

  const openVideo = (videoId) => {
    setSelectedVideoId(videoId);
    setShowVideoDetail(true);
  };

  const formatPublishedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
    return `${Math.floor(diffDays / 365)} năm trước`;
  };

  const renderVideo = ({ item }) => (
    <TouchableOpacity
      style={[styles.videoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      onPress={() => openVideo(item.id.videoId)}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.snippet.thumbnails.medium.url }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {item.contentDetails?.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {youtubeService.formatDuration(item.contentDetails.duration)}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.videoInfo}>
        <Text style={[styles.videoTitle, { color: theme.text }]} numberOfLines={2}>
          {item.snippet.title}
        </Text>
        
        <View style={styles.videoMeta}>
          {item.statistics?.viewCount && (
            <Text style={[styles.metaText, { color: theme.secondaryText }]}>
              {youtubeService.formatViewCount(parseInt(item.statistics.viewCount))} lượt xem
            </Text>
          )}
          <Text style={[styles.metaText, { color: theme.secondaryText }]}>
            • {formatPublishedDate(item.snippet.publishedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => {
    if (!channelInfo) return null;

    return (
      <View style={[styles.channelHeader, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Image
          source={{ uri: channelInfo.snippet.thumbnails.medium.url }}
          style={styles.channelAvatar}
        />
        <View style={styles.channelInfo}>
          <Text style={[styles.channelName, { color: theme.text }]}>
            {channelInfo.snippet.title}
          </Text>
          <Text style={[styles.channelStats, { color: theme.secondaryText }]}>
            {youtubeService.formatViewCount(parseInt(channelInfo.statistics.subscriberCount))} subscribers • {' '}
            {channelInfo.statistics.videoCount} videos
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>YouTube</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={[styles.loadingText, { color: theme.secondaryText }]}>
            Đang tải video...
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>YouTube</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={videos}
        renderItem={renderVideo}
        keyExtractor={(item) => item.id.videoId}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF0000"
          />
        }
        onEndReached={loadMoreVideos}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#FF0000" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="logo-youtube" size={64} color={theme.secondaryText} />
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Không có video nào
            </Text>
          </View>
        }
      />

      <Modal
        visible={showVideoDetail}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowVideoDetail(false);
          setSelectedVideoId(null);
        }}
      >
        {selectedVideoId && (
          <VideoDetailScreen
            navigation={{
              goBack: () => {
                setShowVideoDetail(false);
                setSelectedVideoId(null);
              },
            }}
            route={{ params: { videoId: selectedVideoId } }}
          />
        )}
      </Modal>
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
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  channelHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  channelAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  channelInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  channelName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  channelStats: {
    fontSize: 13,
  },
  videoCard: {
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  videoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginRight: 4,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});
