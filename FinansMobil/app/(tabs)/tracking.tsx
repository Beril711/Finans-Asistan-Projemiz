import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { getTransactions } from '@/services/trackingService';
import SummaryCards from '@/components/tracking/SummaryCards';
import PieChartView from '@/components/tracking/PieChartView';
import AddTransactionForm from '@/components/tracking/AddTransactionForm';
import TransactionList from '@/components/tracking/TransactionList';
import type { Transaction } from '@/types';

export default function TrackingScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await getTransactions();
      const data = Array.isArray(res.data) ? res.data : [];
      setTransactions(data);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Harcama Takip</Text>
        <Text style={styles.headerSubtitle}>Gelir ve giderlerinizi yonetin</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#667eea" />
        }
      >
        <SummaryCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          netBalance={netBalance}
        />

        <PieChartView income={totalIncome} expense={totalExpense} />

        <AddTransactionForm onTransactionAdded={fetchTransactions} />

        <TransactionList
          transactions={transactions}
          loading={loading}
          onRefresh={fetchTransactions}
          onTransactionDeleted={fetchTransactions}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 32,
  },
});
