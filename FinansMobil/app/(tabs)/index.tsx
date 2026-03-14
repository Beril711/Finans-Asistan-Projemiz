import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function HomeScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cikis', 'Cikis yapmak istediginize emin misiniz?', [
      { text: 'Vazgec', style: 'cancel' },
      { text: 'Cikis Yap', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Finans Asistani</Text>
          <Text style={styles.subtitle}>Finanslarinizi kolayca yonetin</Text>
        </View>

        {/* Module Cards */}
        <View style={styles.cardsSection}>
          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() => router.push('/(tabs)/tracking')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
              <MaterialIcons name="account-balance-wallet" size={32} color="#667eea" />
            </View>
            <Text style={styles.cardTitle}>Harcama Takibi</Text>
            <Text style={styles.cardDesc}>Gelir ve giderlerinizi takip edin, kategorilere ayirin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() => router.push('/(tabs)/investing')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#fce7f3' }]}>
              <MaterialIcons name="show-chart" size={32} color="#ec4899" />
            </View>
            <Text style={styles.cardTitle}>Yatirim Simulatoru</Text>
            <Text style={styles.cardDesc}>Sanal para ile yatirim yapin, piyasalari takip edin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() => router.push('/(tabs)/scanner')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#d1fae5' }]}>
              <MaterialIcons name="camera-alt" size={32} color="#10b981" />
            </View>
            <Text style={styles.cardTitle}>Fis Tarayici</Text>
            <Text style={styles.cardDesc}>Fislerinizi tarayin, harcamalarinizi otomatik kaydedin</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <MaterialIcons name="bar-chart" size={24} color="#667eea" />
            <Text style={styles.featureText}>Detayli Raporlar</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="security" size={24} color="#667eea" />
            <Text style={styles.featureText}>Guvenli Giris</Text>
          </View>
          <View style={styles.featureItem}>
            <MaterialIcons name="speed" size={24} color="#667eea" />
            <Text style={styles.featureText}>Hizli Islem</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Cikis Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  cardsSection: {
    gap: 16,
    marginBottom: 28,
  },
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ef4444',
  },
});
