import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, ScrollView, Alert, StatusBar, Platform, RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getTransactions } from '@/services/trackingService';
import type { Transaction } from '@/types';

const COLORS = {
  navyDark: '#0A2472', navyMid: '#1565C0', blue: '#1E88E5',
  cyan: '#29B6F6', cyanLight: '#90CAF9', bgLight: '#F0F4FF',
  cardBg: '#FFFFFF', cardBorder: '#BBDEFB', textDark: '#0A2472',
  textMid: '#1565C0', success: '#43A047', danger: '#E53935',
};

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

export default function HomeScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await getTransactions();
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTransactions([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'INCOME')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'EXPENSE')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  const fmt = (val: number) => val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleLogout = () => {
    Alert.alert('Cikis', 'Cikis yapmak istediginize emin misiniz?', [
      { text: 'Vazgec', style: 'cancel' },
      { text: 'Cikis Yap', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} translucent={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.cyan} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Merhaba,</Text>
              <Text style={styles.title}>Finans Asistanin</Text>
            </View>
            <View style={styles.avatarCircle}>
              <MaterialIcons name="person" size={22} color="#fff" />
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>TOPLAM BAKIYE</Text>
            <Text style={styles.balanceAmount}>₺{fmt(netBalance)}</Text>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatLabel}>Gelir</Text>
                <Text style={[styles.balanceStatValue, { color: '#86EFAC' }]}>₺{fmt(totalIncome)}</Text>
              </View>
              <View style={styles.balanceStatDivider} />
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatLabel}>Gider</Text>
                <Text style={[styles.balanceStatValue, { color: '#FCA5A5' }]}>₺{fmt(totalExpense)}</Text>
              </View>
              <View style={styles.balanceStatDivider} />
              <View style={styles.balanceStat}>
                <Text style={styles.balanceStatLabel}>Islem</Text>
                <Text style={styles.balanceStatValue}>{transactions.length}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Moduller</Text>
          <View style={styles.cardsSection}>
            <TouchableOpacity style={styles.moduleCard} onPress={() => router.push('/(tabs)/tracking')} activeOpacity={0.8}>
              <View style={styles.moduleCardLeft}>
                <View style={[styles.moduleIconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <MaterialIcons name="account-balance-wallet" size={24} color={COLORS.navyMid} />
                </View>
                <View style={styles.moduleCardInfo}>
                  <Text style={styles.cardTitle}>Harcama Takibi</Text>
                  <Text style={styles.cardDesc}>Gelir ve giderlerinizi yonetin</Text>
                </View>
              </View>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>{transactions.length} islem</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.cyanLight} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard} onPress={() => router.push('/(tabs)/investing')} activeOpacity={0.8}>
              <View style={styles.moduleCardLeft}>
                <View style={[styles.moduleIconCircle, { backgroundColor: '#E3F2FD' }]}>
                  <MaterialIcons name="show-chart" size={24} color={COLORS.blue} />
                </View>
                <View style={styles.moduleCardInfo}>
                  <Text style={styles.cardTitle}>Yatirim Simulatoru</Text>
                  <Text style={styles.cardDesc}>Piyasalari takip edin</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.cyanLight} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.moduleCard} onPress={() => router.push('/(tabs)/scanner')} activeOpacity={0.8}>
              <View style={styles.moduleCardLeft}>
                <View style={[styles.moduleIconCircle, { backgroundColor: '#E8F5E9' }]}>
                  <MaterialIcons name="camera-alt" size={24} color={COLORS.success} />
                </View>
                <View style={styles.moduleCardInfo}>
                  <Text style={styles.cardTitle}>Fis Tarayici</Text>
                  <Text style={styles.cardDesc}>Fislerinizi otomatik kaydedin</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.cyanLight} />
            </TouchableOpacity>
          </View>

          {/* Özellikler */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <MaterialIcons name="bar-chart" size={22} color={COLORS.navyMid} />
              <Text style={styles.featureText}>Detayli Raporlar</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <MaterialIcons name="security" size={22} color={COLORS.navyMid} />
              <Text style={styles.featureText}>Guvenli Giris</Text>
            </View>
            <View style={styles.featureDivider} />
            <View style={styles.featureItem}>
              <MaterialIcons name="speed" size={22} color={COLORS.navyMid} />
              <Text style={styles.featureText}>Hizli Islem</Text>
            </View>
          </View>

          {/* Çıkış */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={18} color={COLORS.danger} />
            <Text style={styles.logoutText}>Cikis Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navyDark },
  scrollContent: { flexGrow: 1 },

  header: {
    backgroundColor: COLORS.navyDark,
    paddingHorizontal: 20,
    paddingTop: STATUS_BAR_HEIGHT + 16,
    paddingBottom: 28,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 13, color: COLORS.cyanLight, marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff' },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.navyMid,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },

  balanceCard: {
    backgroundColor: COLORS.navyMid,
    borderRadius: 20, padding: 20,
    borderWidth: 0.5, borderColor: 'rgba(41,182,246,0.3)',
  },
  balanceLabel: { fontSize: 11, color: COLORS.cyanLight, letterSpacing: 1.5, marginBottom: 8 },
  balanceAmount: { fontSize: 36, fontWeight: '700', color: '#fff', marginBottom: 16 },
  balanceDivider: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 14 },
  balanceStats: { flexDirection: 'row' },
  balanceStat: { flex: 1, alignItems: 'center' },
  balanceStatDivider: { width: 0.5, backgroundColor: 'rgba(255,255,255,0.15)' },
  balanceStatLabel: { fontSize: 10, color: COLORS.cyanLight, marginBottom: 4 },
  balanceStatValue: { fontSize: 13, fontWeight: '600', color: '#fff' },

  body: {
    backgroundColor: COLORS.bgLight,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 24, paddingBottom: 30, flex: 1,
  },

  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    color: COLORS.textDark,
    paddingHorizontal: 20, marginBottom: 14,
  },

  cardsSection: { paddingHorizontal: 20, gap: 10, marginBottom: 24 },
  moduleCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: COLORS.cardBorder,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: COLORS.navyDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  moduleCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  moduleIconCircle: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  moduleCardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textDark, marginBottom: 3 },
  cardDesc: { fontSize: 12, color: COLORS.cyanLight },
  cardBadge: {
    backgroundColor: '#E3F2FD', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, marginRight: 6,
  },
  cardBadgeText: { fontSize: 11, color: COLORS.navyMid, fontWeight: '600' },

  featuresSection: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 18,
    marginHorizontal: 20, marginBottom: 20,
    borderWidth: 0.5, borderColor: COLORS.cardBorder, elevation: 2,
  },
  featureItem: { alignItems: 'center', gap: 8, flex: 1 },
  featureDivider: { width: 0.5, height: 32, backgroundColor: COLORS.cardBorder },
  featureText: { fontSize: 11, color: COLORS.textMid, fontWeight: '500', textAlign: 'center' },

  logoutButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderRadius: 12, padding: 15,
    marginHorizontal: 20, borderWidth: 0.5, borderColor: '#FECACA',
  },
  logoutText: { fontSize: 14, fontWeight: '600', color: COLORS.danger },
});