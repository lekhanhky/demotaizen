import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function CoinMarketCapScreen({ navigation }) {
  const { theme } = useTheme();
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCryptoData = async () => {
    try {
      // Using CoinMarketCap API
      const response = await fetch(
        'https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=50',
        {
          headers: {
            'X-CMC_PRO_API_KEY': '98bf37e8c361499095fb8a4289cff029',
          },
        }
      );
      const result = await response.json();
      
      if (result.data) {
        // Transform CoinMarketCap data to match our format
        const transformedData = result.data.map(coin => ({
          id: coin.id.toString(),
          name: coin.name,
          symbol: coin.symbol,
          current_price: coin.quote.USD.price,
          price_change_percentage_24h: coin.quote.USD.percent_change_24h,
          market_cap: coin.quote.USD.market_cap,
          volume_24h: coin.quote.USD.volume_24h,
        }));
        setCryptoData(transformedData);
      }
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCryptoData();
  };

  const formatPrice = (price) => {
    if (price >= 1) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${price.toFixed(6)}`;
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const renderCryptoItem = ({ item, index }) => (
    <View style={[styles.cryptoItem, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
      <Text style={[styles.rank, { color: theme.secondaryText }]}>{index + 1}</Text>
      
      <View style={styles.cryptoInfo}>
        <Text style={[styles.cryptoName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.cryptoSymbol, { color: theme.secondaryText }]}>
          {item.symbol.toUpperCase()}
        </Text>
      </View>

      <View style={styles.priceInfo}>
        <Text style={[styles.price, { color: theme.text }]}>
          {formatPrice(item.current_price)}
        </Text>
        <Text style={[
          styles.change,
          { color: item.price_change_percentage_24h >= 0 ? '#10b981' : '#ef4444' }
        ]}>
          {item.price_change_percentage_24h >= 0 ? '▲' : '▼'} {Math.abs(item.price_change_percentage_24h).toFixed(2)}%
        </Text>
      </View>

      <View style={styles.marketCapInfo}>
        <Text style={[styles.marketCapLabel, { color: theme.secondaryText }]}>Market Cap</Text>
        <Text style={[styles.marketCap, { color: theme.text }]}>
          {formatMarketCap(item.market_cap)}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBackground, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>CoinMarketCap</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1d9bf0" />
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>CoinMarketCap</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={cryptoData}
        renderItem={renderCryptoItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1d9bf0"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
              No crypto data available
            </Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={onRefresh}
        disabled={refreshing}
      >
        <Ionicons 
          name="refresh" 
          size={24} 
          color="#fff" 
          style={refreshing && styles.rotating}
        />
      </TouchableOpacity>
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
  cryptoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  rank: {
    fontSize: 14,
    fontWeight: '600',
    width: 30,
  },
  cryptoInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cryptoName: {
    fontSize: 16,
    fontWeight: '600',
  },
  cryptoSymbol: {
    fontSize: 12,
    marginTop: 2,
  },
  priceInfo: {
    alignItems: 'flex-end',
    marginRight: 16,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  change: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  marketCapInfo: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  marketCapLabel: {
    fontSize: 10,
  },
  marketCap: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1d9bf0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  rotating: {
    opacity: 0.6,
  },
});
