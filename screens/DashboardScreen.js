import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Shield } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>
                {user?.email?.split('@')[0] || 'User'}
              </Text>
            </View>
            <View style={styles.avatar}>
              <User size={32} color="white" />
            </View>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Shield size={24} color="#1d9bf0" />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Account Status</Text>
                <Text style={styles.cardSubtitle}>
                  Your account is active and secure
                </Text>
              </View>
            </View>
            <View style={styles.infoContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Edit Profile</Text>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Settings</Text>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Privacy & Security</Text>
                <Text style={styles.actionArrow}>→</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={signOut}
            style={styles.signOutButton}
            activeOpacity={0.9}
          >
            <View style={styles.signOutContent}>
              <LogOut size={20} color="#F8A5A5" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You're using a secure connection
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  welcomeText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 24,
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#333',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  infoContainer: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 16,
  },
  infoLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  infoValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  actionContainer: {
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: '#333',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
  },
  actionArrow: {
    color: '#1d9bf0',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#F8A5A5',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 16,
  },
  signOutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#F8A5A5',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    marginTop: 32,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});