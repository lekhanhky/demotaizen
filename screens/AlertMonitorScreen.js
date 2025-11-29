import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { showQuickAlert } from '../utils/alertHelper';

export default function AlertMonitorScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchMonitors();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('alert_monitor_realtime')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alert_monitor'
        },
        (payload) => {
          console.log('🔔 Monitor updated:', payload);
          const newData = payload.new;
          
          // Cập nhật UI ngay lập tức
          setMonitors(prev => 
            prev.map(m => m.id === newData.id ? newData : m)
          );
          
          // Service sẽ tự động xử lý cảnh báo, screen chỉ cập nhật UI
          console.log('📊 UI updated, alert service handles notification');
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from realtime');
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMonitors = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_monitor')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMonitors(data || []);
    } catch (error) {
      console.error('Error fetching monitors:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateValue = async (monitor) => {
    if (!editValue.trim()) return;

    const newValue = parseFloat(editValue);
    if (isNaN(newValue)) {
      Alert.alert('Lỗi', 'Vui lòng nhập số hợp lệ');
      return;
    }

    try {
      console.log('Updating value to:', newValue);
      
      const { data, error } = await supabase
        .from('alert_monitor')
        .update({ current_value: newValue })
        .eq('id', monitor.id)
        .select();

      if (error) throw error;

      console.log('Update successful:', data);
      
      // Cập nhật local state ngay lập tức
      setMonitors(prev => 
        prev.map(m => m.id === monitor.id ? { ...m, current_value: newValue } : m)
      );

      // Service sẽ tự động phát hiện và cảnh báo qua realtime
      console.log('✅ Value updated, alert service will handle notification');

      setEditingId(null);
      setEditValue('');
    } catch (error) {
      console.error('Error updating value:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật giá trị: ' + error.message);
    }
  };

  const getStatusColor = (monitor) => {
    const percentage = (monitor.current_value / monitor.threshold_value) * 100;
    if (percentage >= 100) return '#dc3545'; // Đỏ - Nguy hiểm
    if (percentage >= 80) return '#fd7e14'; // Cam - Cảnh báo
    if (percentage >= 60) return '#ffc107'; // Vàng - Chú ý
    return '#28a745'; // Xanh - An toàn
  };

  const renderMonitor = ({ item }) => {
    const isEditing = editingId === item.id;
    const statusColor = getStatusColor(item);
    const percentage = Math.min((item.current_value / item.threshold_value) * 100, 100);

    return (
      <View style={[styles.monitorCard, { borderLeftColor: statusColor, borderLeftWidth: 4 }]}>
        <View style={styles.monitorHeader}>
          <Text style={styles.monitorName}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>
              {item.current_value > item.threshold_value ? 'CẢNH BÁO' : 'AN TOÀN'}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${percentage}%`, backgroundColor: statusColor }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
        </View>

        {isEditing ? (
          <View style={styles.editContainer}>
            <Text style={styles.editLabel}>Nhập giá trị mới:</Text>
            <TextInput
              style={[styles.editInput, { 
                color: theme.text || '#000',
                backgroundColor: theme.inputBackground || '#f5f5f5',
                borderColor: theme.primary || '#1d9bf0'
              }]}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              placeholder="Nhập số..."
              placeholderTextColor={theme.placeholderText || '#999'}
              autoFocus
              selectTextOnFocus
            />
          </View>
        ) : (
          <View style={styles.valuesContainer}>
            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>Giá trị hiện tại</Text>
              <Text style={[styles.valueNumber, { color: statusColor }]}>
                {item.current_value}
              </Text>
            </View>

            <View style={styles.valueBox}>
              <Text style={styles.valueLabel}>Ngưỡng cảnh báo</Text>
              <Text style={styles.valueNumber}>{item.threshold_value}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={() => handleUpdateValue(item)}
              >
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => {
                  setEditingId(null);
                  setEditValue('');
                }}
              >
                <Ionicons name="close" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Hủy</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => {
                setEditingId(item.id);
                setEditValue(item.current_value.toString());
              }}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Sửa giá trị</Text>
            </TouchableOpacity>
          )}
        </View>

        {item.alert_message && (
          <View style={styles.alertMessageBox}>
            <Ionicons name="warning" size={16} color="#fd7e14" />
            <Text style={styles.alertMessage}>{item.alert_message}</Text>
          </View>
        )}
      </View>
    );
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Theo dõi Cảnh báo</Text>
        <TouchableOpacity onPress={fetchMonitors}>
          <Ionicons name="refresh" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={theme.primary} />
        <Text style={[styles.infoText, { color: theme.text }]}>
          Sửa giá trị {'>'} ngưỡng để test cảnh báo realtime
        </Text>
      </View>

      <FlatList
        data={monitors}
        renderItem={renderMonitor}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              Chưa có monitor nào
            </Text>
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
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.inputBackground || '#f0f0f0',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  monitorCard: {
    backgroundColor: theme.cardBackground || '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monitorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monitorName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text || '#000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.inputBackground || '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    color: theme.secondaryText || '#666',
    width: 40,
    textAlign: 'right',
  },
  valuesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  valueBox: {
    flex: 1,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 12,
    color: theme.secondaryText || '#666',
    marginBottom: 4,
  },
  valueNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text || '#000',
  },
  editContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.inputBackground || '#f5f5f5',
    borderRadius: 8,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text || '#000',
    marginBottom: 8,
  },
  editInput: {
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: theme.primary || '#1d9bf0',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  alertMessageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
    gap: 8,
  },
  alertMessage: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
