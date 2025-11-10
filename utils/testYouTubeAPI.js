// Script để test YouTube API trực tiếp
import { YOUTUBE_CONFIG } from '../config/youtube';

export async function testYouTubeAPI() {
  const API_KEY = YOUTUBE_CONFIG.API_KEY;
  const CHANNEL_ID = YOUTUBE_CONFIG.CHANNEL_ID;
  
  console.log('=== Testing YouTube API ===');
  console.log('API Key:', API_KEY.substring(0, 10) + '...');
  console.log('Channel ID:', CHANNEL_ID);
  
  try {
    // Test 1: Channel Info
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${CHANNEL_ID}&key=${API_KEY}`;
    console.log('\n1. Testing Channel Info...');
    const channelResponse = await fetch(channelUrl);
    const channelData = await channelResponse.json();
    
    if (channelData.error) {
      console.error('❌ Channel API Error:', channelData.error.message);
      return;
    }
    
    if (channelData.items && channelData.items.length > 0) {
      const channel = channelData.items[0];
      console.log('✅ Channel found:', channel.snippet.title);
      console.log('   Subscribers:', channel.statistics.subscriberCount);
      console.log('   Total videos:', channel.statistics.videoCount);
    } else {
      console.log('❌ No channel found with this ID');
      return;
    }
    
    // Test 2: Search Videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&order=date&type=video&key=${API_KEY}`;
    console.log('\n2. Testing Search Videos...');
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.error) {
      console.error('❌ Search API Error:', searchData.error.message);
      return;
    }
    
    console.log('✅ Videos found:', searchData.items?.length || 0);
    console.log('   Total results:', searchData.pageInfo?.totalResults || 0);
    console.log('   Results per page:', searchData.pageInfo?.resultsPerPage || 0);
    console.log('   Has next page:', !!searchData.nextPageToken);
    
    if (searchData.items && searchData.items.length > 0) {
      console.log('\n   First 5 videos:');
      searchData.items.slice(0, 5).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.snippet.title}`);
      });
    }
    
    // Test 3: Video Details
    if (searchData.items && searchData.items.length > 0) {
      const videoIds = searchData.items.slice(0, 5).map(v => v.id.videoId).join(',');
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${API_KEY}`;
      console.log('\n3. Testing Video Details...');
      const videosResponse = await fetch(videosUrl);
      const videosData = await videosResponse.json();
      
      if (videosData.error) {
        console.error('❌ Videos API Error:', videosData.error.message);
        return;
      }
      
      console.log('✅ Video details fetched:', videosData.items?.length || 0);
    }
    
    console.log('\n=== All tests passed! ===');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Để chạy test, import và gọi hàm này trong YouTubeScreen useEffect
