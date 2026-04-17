import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView,
  ScrollView, RefreshControl, StatusBar,
  TouchableOpacity, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getTransactions } from '@/services/trackingService';
import SummaryCards from '@/components/tracking/SummaryCards';
import PieChartView from '@/components/tracking/PieChartView';
import AddTransactionForm from '@/components/tracking/AddTransactionForm';
import TransactionList from '@/components/tracking/TransactionList';
import type { Transaction } from '@/types';

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

export default function TrackingScreen() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await getTransactions();
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch { setTransactions([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  const onRefresh = () => { setRefreshing(true); fetchTransactions(); };

  const totalIncome = transactions.filter((t) => t.transaction_type === 'INCOME').reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalExpense = transactions.filter((t) => t.transaction_type === 'EXPENSE').reduce((s, t) => s + Number(t.amount || 0), 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2472" translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/')}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Harcama Takip</Text>
          <Text style={styles.headerSubtitle}>Gelir ve giderlerinizi yonetin</Text>
        </View>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#29B6F6" />}
      >
        <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} netBalance={netBalance} />
        <PieChartView income={totalIncome} expense={totalExpense} />
        <AddTransactionForm onTransactionAdded={fetchTransactions} />
        <TransactionList transactions={transactions} loading={loading} onRefresh={fetchTransactions} onTransactionDeleted={fetchTransactions} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A2472' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: STATUS_BAR_HEIGHT + 16,
    paddingBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#90CAF9', marginTop: 2 },
  content: { flex: 1, backgroundColor: '#F0F4FF', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  contentInner: { padding: 16, paddingBottom: 32 },
});