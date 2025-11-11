import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function CryptoScreen({ navigation }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolioDetails, setPortfolioDetails] = useState([]);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('master_portfolio')
        .select('*')
        .order('rank', { ascending: true });

      if (error) throw error;
      setPortfolios(data || []);
      
      // Auto-select first portfolio
      if (data && data.length > 0) {
        setSelectedPortfolio(data[0]);
        fetchPortfolioDetails(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPortfolioDetails = async (portfolioId) => {
    try {
      const { data, error } = await supabase
        .from('detail_portfolio')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('rank', { ascending: true });

      if (error) throw error;
      setPortfolioDetails(data || []);
    } catch (error) {
      console.error('Error fetching portfolio details:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPortfolios();
  };

  const handlePortfolioSelect = (portfolio) => {
    setSelectedPortfolio(portfolio);
    fetchPortfolioDetails(portfolio.id);
  };

  const formatNumber = (num) => {
    if (!num) return 'N/A';
    return parseFloat(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercent = (num) => {
    if (num === null || num === undefined) return 'N/A';
    const value = parseFloat(num);
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getPercentColor = (num) => {
    if (num === null || num === undefined) return theme.secondaryText;
    return parseFloat(num) >= 0 ? '#10b981' : '#ef4444';
  };

  const renderPortfolioCard = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.portfolioCard,
        { 
          backgroundColor: theme.postBackground,
          borderColor: selectedPortfolio?.id === item.id ? theme.primary : theme.border,
          borderWidth: selectedPortfolio?.id === item.id ? 2 : 1,
        }
      ]}
      onPress={() => handlePortfolioSelect(item)}
    >
      <View style={styles.portfolioHeader}>
        <Text style={[styles.portfolioRank, { color: theme.secondaryText }]}>
          #{item.rank}
        </Text>
        <Text style={[styles.portfolioUser, { color: theme.primary }]}>
          {item.user_name}
        </Text>
      </View>
      
      <Text style={[styles.portfolioName, { color: theme.text }]} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.portfolioStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Value</Text>
          <Text style={[styles.statValue, { color: theme.text }]}>
            {formatNumber(item.last_value)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>24h</Text>
          <Text style={[styles.statValue, { color: getPercentColor(item.change_24h_percent) }]}>
            {formatPercent(item.change_24h_percent)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.secondaryText }]}>1Y</Text>
          <Text style={[styles.statValue, { color: getPercentColor(item.change_1y_percent) }]}>
            {formatPercent(item.change_1y_percent)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDetailRow = ({ item }) => (
    <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
      <View style={styles.detailLeft}>
        {item.rank && (
          <Text style={[styles.detailRank, { color: theme.secondaryText }]}>
            {item.rank}
          </Text>
        )}
        <View style={styles.coinInfo}>
          <Text style={[styles.coinSymbol, { color: theme.text }]}>
            {item.symbol}
          </Text>
          <Text style={[styles.coinName, { color: theme.secondaryText }]}>
            {item.coin_name}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailRight}>
        <Text style={[styles.detailPrice, { color: theme.text }]}>
          ${formatNumber(item.last_price)}
        </Text>
        <Text style={[styles.detailPercent, { color: getPercentColor(item.change_24h_percent) }]}>
          {formatPercent(item.change_24h_percent)}
        </Text>
        <Text style={[styles.detailAllocation, { color: theme.secondaryText }]}>
          {formatPercent(item.percent_of_total_today)}
        </Text>
      </View>
    </View>
  );

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Crypto Portfolio</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Master Portfolios List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Master Portfolios
          </Text>
          <FlatList
            data={portfolios}
            renderItem={renderPortfolioCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.portfolioList}
          />
        </View>

        {/* Selected Portfolio Details */}
        {selectedPortfolio && (
          <View style={styles.section}>
            <View style={styles.detailHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Holdings
              </Text>
              <Text style={[styles.detailSubtitle, { color: theme.secondaryText }]}>
                {portfolioDetails.length} assets
              </Text>
            </View>

            {/* Performance Summary */}
            <View style={[styles.performanceCard, { backgroundColor: theme.postBackground, borderColor: theme.border }]}>
              <Text style={[styles.performanceTitle, { color: theme.text }]}>
                Performance
              </Text>
              <View style={styles.performanceGrid}>
                <View style={styles.performanceItem}>
                  <Text style={[styles.performanceLabel, { color: theme.secondaryText }]}>1 Month</Text>
                  <Text style={[styles.performanceValue, { color: getPercentColor(selectedPortfolio.change_1mo_percent) }]}>
                    {formatPercent(selectedPortfolio.change_1mo_percent)}
                  </Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={[styles.performanceLabel, { color: theme.secondaryText }]}>3 Months</Text>
                  <Text style={[styles.performanceValue, { color: getPercentColor(selectedPortfolio.change_3mo_percent) }]}>
                    {formatPercent(selectedPortfolio.change_3mo_percent)}
                  </Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={[styles.performanceLabel, { color: theme.secondaryText }]}>1 Year</Text>
                  <Text style={[styles.performanceValue, { color: getPercentColor(selectedPortfolio.change_1y_percent) }]}>
                    {formatPercent(selectedPortfolio.change_1y_percent)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Detail Table Header */}
            <View style={[styles.tableHeader, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
              <Text style={[styles.tableHeaderText, { color: theme.secondaryText }]}>Asset</Text>
              <View style={styles.tableHeaderRight}>
                <Text style={[styles.tableHeaderText, { color: theme.secondaryText }]}>Price</Text>
                <Text style={[styles.tableHeaderText, { color: theme.secondaryText }]}>24h</Text>
                <Text style={[styles.tableHeaderText, { color: theme.secondaryText }]}>Alloc</Text>
              </View>
            </View>

            <FlatList
              data={portfolioDetails}
              renderItem={renderDetailRow}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
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
  },
  headerRight: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  portfolioList: {
    paddingHorizontal: 16,
  },
  portfolioCard: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  portfolioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  portfolioRank: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  portfolioUser: {
    fontSize: 12,
    fontWeight: '600',
  },
  portfolioName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    minHeight: 40,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  detailSubtitle: {
    fontSize: 14,
  },
  performanceCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tableHeaderRight: {
    flexDirection: 'row',
    gap: 40,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailRank: {
    fontSize: 12,
    width: 30,
  },
  coinInfo: {
    flex: 1,
  },
  coinSymbol: {
    fontSize: 14,
    fontWeight: '600',
  },
  coinName: {
    fontSize: 12,
  },
  detailRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  detailPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailPercent: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailAllocation: {
    fontSize: 11,
  },
});
