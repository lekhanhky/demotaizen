import { supabase } from '../lib/supabase';

/**
 * Tự động tạo user profile nếu chưa tồn tại
 * @param {string} userId - ID của user
 * @returns {Promise<Object>} Profile data hoặc null
 */
export const ensureUserProfile = async (userId) => {
  try {
    // Kiểm tra xem profile đã tồn tại chưa
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Nếu đã có profile, return luôn
    if (existingProfile && !checkError) {
      return existingProfile;
    }

    // Nếu chưa có, tạo profile mới
    const { data: user } = await supabase.auth.getUser();
    
    const username = `user${userId.substring(0, 8)}`;
    const displayName = user?.user?.email?.split('@')[0] || 'User';

    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        username: username,
        display_name: displayName,
        bio: null,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return null;
    }

    return newProfile;
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return null;
  }
};

/**
 * Tạo profile cho user mới đăng ký
 * @param {string} userId - ID của user
 * @param {Object} metadata - Metadata từ signup (username, display_name, etc.)
 * @returns {Promise<Object>} Profile data hoặc null
 */
export const createUserProfile = async (userId, metadata = {}) => {
  try {
    const username = metadata.username || `user${userId.substring(0, 8)}`;
    const displayName = metadata.display_name || metadata.email?.split('@')[0] || 'User';

    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        username: username.toLowerCase(),
        display_name: displayName,
        bio: metadata.bio || null,
        avatar_url: metadata.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
};
