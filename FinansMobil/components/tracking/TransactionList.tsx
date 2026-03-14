import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { deleteTransaction } from '@/services/trackingService';
import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
  loading: boolean;
  onRefresh: () => void;
  onTransactionDeleted: () => void;
}

export default function TransactionList({
  transactions,
  loading,
  onRefresh,
  onTransactionDeleted,
}: Props) {
  const formatMoney = (val: string | number) =>
    Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleDelete = (id: number) => {
    Alert.alert('Sil', 'Bu islemi silmek istediginize emin misiniz?', [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction(id);
            onTransactionDeleted();
          } catch {
            Alert.alert('Hata', 'Islem silinemedi.');
          }
        },
      },
    ]);
  };

  const handleDeleteAll = () => {
    if (transactions.length === 0) return;
    Alert.alert('Tumunu Sil', 'Tum islemleri silmek istediginize emin misiniz?', [
      { text: 'Vazgec', style: 'cancel' },
      {
        text: 'Tumunu Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await Promise.all(transactions.map((t) => deleteTransaction(t.id)));
            onTransactionDeleted();
          } catch {
            Alert.alert('Hata', 'Islemler silinemedi.');
          }
        },
      },
    ]);
  };

  const totalIncome = transactions
    .filter((t) => t.transaction_type === 'INCOME')
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.transaction_type === 'EXPENSE')
    .reduce((s, t) => s + Number(t.amount), 0);

  const renderItem = ({ item }: { item: Transaction }) => {
    const isIncome = item.transaction_type === 'INCOME';
    return (
      <View style={[styles.card, { borderLeftColor: isIncome ? '#10b981' : '#ef4444' }]}>
        <View style={styles.cardHeader}>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: isIncome ? '#dcfce7' : '#fee2e2' },
            ]}
          >
            <Text style={{ color: isIncome ? '#10b981' : '#ef4444', fontSize: 11, fontWeight: '600' }}>
              {isIncome ? 'GELIR' : 'GIDER'}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>

        <Text style={styles.categoryText}>{item.category_name || 'Kategorisiz'}</Text>
        {item.description ? (
          <Text style={styles.descText}>{item.description}</Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text
            style={[
              styles.amountText,
              { color: isIncome ? '#10b981' : '#ef4444' },
            ]}
          >
            {isIncome ? '+' : '-'}{formatMoney(item.amount)} TL
          </Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <MaterialIcons name="delete-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>
          Islemler ({transactions.length})
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onRefresh}>
            <MaterialIcons name="refresh" size={22} color="#667eea" />
          </TouchableOpacity>
          {transactions.length > 0 && (
            <TouchableOpacity onPress={handleDeleteAll} style={{ marginLeft: 12 }}>
              <MaterialIcons name="delete-sweep" size={22} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Summary Row */}
      {transactions.length > 0 && (
        <View style={styles.summaryRow}>
          <Text style={{ color: '#10b981', fontSize: 12, fontWeight: '600' }}>
            +{formatMoney(totalIncome)}
          </Text>
          <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: '600' }}>
            -{formatMoney(totalExpense)}
          </Text>
          <Text
            style={{
              color: totalIncome - totalExpense >= 0 ? '#10b981' : '#ef4444',
              fontSize: 12,
              fontWeight: 'bold',
            }}
          >
            Net: {formatMoney(totalIncome - totalExpense)}
          </Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="small" color="#667eea" style={{ marginTop: 20 }} />
      ) : transactions.length === 0 ? (
        <Text style={styles.emptyText}>Henuz islem bulunmuyor</Text>
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  descText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 10,
  },
});
