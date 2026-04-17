import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  FlatList, Alert, ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { deleteTransaction } from '@/services/trackingService';
import type { Transaction } from '@/types';

const COLORS = {
  navyDark: '#0A2472', navyMid: '#1565C0', blue: '#1E88E5',
  cyan: '#29B6F6', cyanLight: '#90CAF9', bgLight: '#F0F4FF', cardBorder: '#BBDEFB',
};

interface Props {
  transactions: Transaction[];
  loading: boolean;
  onRefresh: () => void;
  onTransactionDeleted: () => void;
}

export default function TransactionList({ transactions, loading, onRefresh, onTransactionDeleted }: Props) {
  const fmt = (val: string | number) =>
    Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleDelete = (id: number) => {
    Alert.alert('Sil', 'Bu islemi silmek istediginize emin misiniz?', [
      { text: 'Vazgec', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        try { await deleteTransaction(id); onTransactionDeleted(); }
        catch { Alert.alert('Hata', 'Islem silinemedi.'); }
      }},
    ]);
  };

  const handleDeleteAll = () => {
    if (transactions.length === 0) return;
    Alert.alert('Tumunu Sil', 'Tum islemleri silmek istediginize emin misiniz?', [
      { text: 'Vazgec', style: 'cancel' },
      { text: 'Tumunu Sil', style: 'destructive', onPress: async () => {
        try { await Promise.all(transactions.map((t) => deleteTransaction(t.id))); onTransactionDeleted(); }
        catch { Alert.alert('Hata', 'Islemler silinemedi.'); }
      }},
    ]);
  };

  const totalIncome = transactions.filter((t) => t.transaction_type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.transaction_type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
  const net = totalIncome - totalExpense;

  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.transaction_type === 'INCOME';
    return (
      <View style={[styles.card, { borderLeftColor: isIncome ? COLORS.cyan : COLORS.navyMid }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: isIncome ? '#E3F2FD' : '#E8EAF6' }]}>
            <Text style={[styles.typeBadgeTxt, { color: isIncome ? COLORS.cyan : COLORS.navyMid }]}>
              {isIncome ? 'GELİR' : 'GİDER'}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        <Text style={styles.categoryText}>{item.category_name || 'Kategorisiz'}</Text>
        {item.description ? <Text style={styles.descText}>{item.description}</Text> : null}
        <View style={styles.cardFooter}>
          <Text style={[styles.amountText, { color: isIncome ? COLORS.cyan : COLORS.navyMid }]}>
            {isIncome ? '+' : '-'}₺{fmt(item.amount)}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
            <MaterialIcons name="delete-outline" size={20} color={COLORS.navyMid} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>İşlemler ({transactions.length})</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onRefresh} style={styles.iconBtn}>
            <MaterialIcons name="refresh" size={22} color={COLORS.navyMid} />
          </TouchableOpacity>
          {transactions.length > 0 && (
            <TouchableOpacity onPress={handleDeleteAll} style={styles.iconBtn}>
              <MaterialIcons name="delete-sweep" size={22} color={COLORS.navyMid} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {transactions.length > 0 && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gelir</Text>
            <Text style={[styles.summaryValue, { color: COLORS.cyan }]}>+₺{fmt(totalIncome)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Gider</Text>
            <Text style={[styles.summaryValue, { color: COLORS.navyMid }]}>-₺{fmt(totalExpense)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Net</Text>
            <Text style={[styles.summaryValue, { color: COLORS.blue }]}>₺{fmt(net)}</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="small" color={COLORS.navyMid} style={{ marginTop: 20 }} />
      ) : transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <MaterialIcons name="receipt-long" size={36} color={COLORS.cyanLight} />
          </View>
          <Text style={styles.emptyTitle}>Henuz islem bulunmuyor</Text>
          <Text style={styles.emptySubtitle}>Yukaridaki formu kullanarak islem ekleyin</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 0.5, borderColor: COLORS.cardBorder,
    shadowColor: COLORS.navyDark, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.navyDark },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 6, borderRadius: 8, backgroundColor: COLORS.bgLight },
  summaryRow: {
    flexDirection: 'row', backgroundColor: COLORS.bgLight,
    borderRadius: 12, padding: 12, marginBottom: 14,
    borderWidth: 0.5, borderColor: COLORS.cardBorder,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 0.5, backgroundColor: COLORS.cardBorder },
  summaryLabel: { fontSize: 10, color: COLORS.cyanLight, marginBottom: 3 },
  summaryValue: { fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: '#F8FBFF', borderRadius: 12, padding: 14,
    marginBottom: 8, borderLeftWidth: 4,
    borderWidth: 0.5, borderColor: COLORS.cardBorder,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeTxt: { fontSize: 10, fontWeight: '700' },
  dateText: { fontSize: 11, color: COLORS.cyanLight },
  categoryText: { fontSize: 14, fontWeight: '600', color: COLORS.navyDark, marginBottom: 3 },
  descText: { fontSize: 12, color: COLORS.cyanLight, marginBottom: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  amountText: { fontSize: 17, fontWeight: '700' },
  deleteBtn: { padding: 4, borderRadius: 8, backgroundColor: COLORS.bgLight },
  emptyState: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  emptyIconCircle: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: COLORS.navyDark },
  emptySubtitle: { fontSize: 12, color: COLORS.cyanLight, textAlign: 'center' },
});