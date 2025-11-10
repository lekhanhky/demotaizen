// YouTube API Configuration
export const YOUTUBE_CONFIG = {
  API_KEY: 'AIzaSyCrJtQGZlz7HlL-cpnyQT4j96-0WZbYNIU', // Thay bằng API key của bạn
  
  // Kênh của bạn (có thể chỉ có 1 video)
  // CHANNEL_ID: 'UCGYepwBe-o2Gvx-Lnf_dPIw',
  
  // Kênh test có nhiều video (TED Talks)
  CHANNEL_ID: 'UCGYepwBe-o2Gvx-Lnf_dPIw',
  
  MAX_RESULTS: 50, // Số video tối đa mỗi lần fetch
};

// Hướng dẫn lấy YouTube API Key:
// 1. Truy cập: https://console.cloud.google.com/
// 2. Tạo project mới hoặc chọn project có sẵn
// 3. Enable YouTube Data API v3
// 4. Tạo credentials (API Key)
// 5. Copy API Key vào đây

// Hướng dẫn lấy Channel ID:
// 1. Truy cập kênh YouTube của bạn
// 2. URL sẽ có dạng: youtube.com/channel/CHANNEL_ID
// 3. Hoặc vào Settings > Advanced settings để xem Channel ID
