import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import SimpleAuthScreen from '../components/auth/SimpleAuthScreen';

export default function NewLoginScreen() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8BA888" />
      </View>
    );
  }

  return <SimpleAuthScreen />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});