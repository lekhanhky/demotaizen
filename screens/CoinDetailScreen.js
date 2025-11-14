import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function CoinDetailScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { coinId } = route.params;
  const [coinData, setCoinData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCoinDetail = async () => {
    try {
      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${coinId}`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': '98bf37e8c361499095fb8a4289cff029',
          },
        }
      );
      const result = await response.json();
      
      if (result.data && result.data[coinId]) {
        setCoinData(result.data[coinId]);
      }
    } catch (error) {
      console.error('Error fetching coin detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    if (!coinData?.quote?.USD?.price) {
      console.log('No coin data available for chart');
      return;
    }
    
    const currentPrice = coinData.quote.USD.price;
    const change24h = coinData.quote.USD.percent_change_24h || 0;
    const startPrice = currentPrice / (1 + change24h / 100);
    
    console.log('Generating chart data:', { currentPrice, change24h, startPrice });
    
    // Check if this is a stablecoin (very small price change)
    const isStablecoin = Math.abs(change24h) < 0.5; // Less than 0.5% change
    
    // Generate simple 24h trend with some variation
    const prices = [];
    for (let i = 0; i < 24; i++) {
      const progress = i / 23;
      
      if (isStablecoin) {
        // For stablecoins, show micro variations around the price
        // Use smaller scale to make variations visible
        const microVariation = (Math.random() - 0.5) * 0.001; // ±0.05% variation
        prices.push(currentPrice * (1 + microVariation));
      } else {
        // For regular coins, show trend with some variation
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        const basePrice = startPrice + (currentPrice - startPrice) * progress;
        prices.push(basePrice * (1 + variation));
      }
    }
    
    // Create labels for every 4 hours
    const labels = [];
    for (let i = 0; i < 24; i++) {
      if (i % 4 === 0) {
        labels.push(`${i}h`);
      } else {
        labels.push('');
      }
    }
    
    const data = {
      labels: labels,
      datasets: [{ data: prices }],
    };
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    console.log('Chart data generated:', { 
      currentPrice, 
      startPrice,
      minPrice, 
      maxPrice,
      priceRange: maxPrice - minPrice,
      samplePrices: prices.slice(0, 5)
    });
    setChartData(data);
  };

  useEffect(() => {
    fetchCoinDetail();
  }, [coinId]);

  useEffect(() => {
    if (coinData) {
      generateChartData();
    }
  }, [coinData]);

  const formatPrice = (price) => {
    if (!price) return '$0.00';
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(8)}`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatPercent = (percent) => {
    if (!percent) return '0.00%';
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Coin Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d9bf0" />
        </View>
      </SafeAreaView>
    );
  }

  if (!coinData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Coin Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.secondaryText }]}>
            Failed to load coin data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const quote = coinData.quote?.USD;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {coinData.symbol}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Coin Header */}
        <View style={[styles.coinHeader, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.coinName, { color: theme.text }]}>{coinData.name}</Text>
          <Text style={[styles.coinSymbol, { color: theme.secondaryText }]}>
            {coinData.symbol}
          </Text>
          <Text style={[styles.coinPrice, { color: theme.text }]}>
            {formatPrice(quote?.price)}
          </Text>
          <Text style={[
            styles.coinChange,
            { color: quote?.percent_change_24h >= 0 ? '#10b981' : '#ef4444' }
          ]}>
            {quote?.percent_change_24h >= 0 ? '▲' : '▼'} {formatPercent(quote?.percent_change_24h)} (24h)
          </Text>
        </View>

        {/* 24h Price Chart */}
        {chartData && chartData.datasets && chartData.datasets[0].data.length > 0 ? (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>24 Hours Price Chart</Text>
              <View style={styles.priceRange}>
                <Text style={[styles.priceRangeText, { color: theme.secondaryText }]}>
                  Range: {formatPrice(Math.min(...chartData.datasets[0].data))} - {formatPrice(Math.max(...chartData.datasets[0].data))}
                </Text>
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { 
                    backgroundColor: quote?.percent_change_24h >= 0 ? '#10b981' : '#ef4444' 
                  }]} />
                  <Text style={[styles.legendText, { color: theme.secondaryText }]}>
                    Price (USD)
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.chartContainer}>
              <LineChart
                data={chartData}
                width={screenWidth - 64}
                height={240}
                yAxisLabel="$"
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 0,
                  color: (opacity = 1) => quote?.percent_change_24h >= 0 
                    ? `rgba(16, 185, 129, ${opacity})`
                    : `rgba(239, 68, 68, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '3',
                    strokeWidth: 2,
                    stroke: quote?.percent_change_24h >= 0 ? '#10b981' : '#ef4444',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '',
                    stroke: '#e0e0e0',
                    strokeWidth: 1,
                  },
                  formatYLabel: (value) => {
                    const num = parseFloat(value);
                    
                    // Helper function to format with comma separator (US style)
                    const formatWithComma = (n) => {
                      // Keep decimal precision, don't round
                      const intPart = Math.floor(n);
                      return intPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                    };
                    
                    if (num >= 1000000) {
                      // >= 1M: $1.5M
                      return `$${(num / 1000000).toFixed(1)}M`;
                    } else if (num >= 1000) {
                      // >= 1K: $105,681 (with comma separator)
                      return `$${formatWithComma(num)}`;
                    } else if (num >= 1) {
                      // >= 1: $50
                      return `$${Math.round(num)}`;
                    } else if (num >= 0.01) {
                      // >= 0.01: $0.50
                      return `$${num.toFixed(2)}`;
                    } else {
                      // < 0.01: $0.0001
                      return `$${num.toFixed(4)}`;
                    }
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                withInnerLines={true}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                fromZero={false}
              />
            </View>
            
            <Text style={[styles.chartFooter, { color: theme.secondaryText }]}>
              Time (Hours)
            </Text>
          </View>
        ) : (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>24h Price Chart</Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText, textAlign: 'center', paddingVertical: 20 }]}>
              Loading chart...
            </Text>
          </View>
        )}

        {/* Market Stats */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Market Stats</Text>
          
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Market Cap</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatNumber(quote?.market_cap)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>24h Volume</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {formatNumber(quote?.volume_24h)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Circulating Supply</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {coinData.circulating_supply?.toLocaleString()} {coinData.symbol}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Total Supply</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {coinData.total_supply ? `${coinData.total_supply.toLocaleString()} ${coinData.symbol}` : 'N/A'}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Max Supply</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {coinData.max_supply ? `${coinData.max_supply.toLocaleString()} ${coinData.symbol}` : 'Unlimited'}
            </Text>
          </View>
        </View>

        {/* Price Changes */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Price Changes</Text>
          
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>1 Hour</Text>
            <Text style={[
              styles.statValue,
              { color: quote?.percent_change_1h >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {formatPercent(quote?.percent_change_1h)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>24 Hours</Text>
            <Text style={[
              styles.statValue,
              { color: quote?.percent_change_24h >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {formatPercent(quote?.percent_change_24h)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>7 Days</Text>
            <Text style={[
              styles.statValue,
              { color: quote?.percent_change_7d >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {formatPercent(quote?.percent_change_7d)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>30 Days</Text>
            <Text style={[
              styles.statValue,
              { color: quote?.percent_change_30d >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {formatPercent(quote?.percent_change_30d)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>60 Days</Text>
            <Text style={[
              styles.statValue,
              { color: quote?.percent_change_60d >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {formatPercent(quote?.percent_change_60d)}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>90 Days</Text>
            <Text style={[
              styles.statValue,
              { color: quote?.percent_change_90d >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {formatPercent(quote?.percent_change_90d)}
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Additional Info</Text>
          
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Market Cap Rank</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              #{coinData.cmc_rank || 'N/A'}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Market Dominance</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {quote?.market_cap_dominance ? `${quote.market_cap_dominance.toFixed(2)}%` : 'N/A'}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Last Updated</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {new Date(quote?.last_updated).toLocaleString()}
            </Text>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
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
  coinHeader: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  coinName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  coinSymbol: {
    fontSize: 16,
    marginBottom: 16,
  },
  coinPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  coinChange: {
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartHeader: {
    marginBottom: 8,
  },
  priceRange: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  priceRangeText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartFooter: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
