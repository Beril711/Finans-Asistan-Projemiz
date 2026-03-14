import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Props {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export default function SummaryCards({ totalIncome, totalExpense, netBalance }: Props) {
  const formatMoney = (val: number) =>
    val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={styles.container}>
      <View style={[styles.card, styles.incomeCard]}>
        <MaterialIcons name="trending-up" size={22} color="#10b981" />
        <Text style={styles.cardLabel}>Toplam Gelir</Text>
        <Text style={[styles.cardValue, { color: '#10b981' }]}>{formatMoney(totalIncome)} TL</Text>
      </View>

      <View style={[styles.card, styles.expenseCard]}>
        <MaterialIcons name="trending-down" size={22} color="#ef4444" />
        <Text style={styles.cardLabel}>Toplam Gider</Text>
        <Text style={[styles.cardValue, { color: '#ef4444' }]}>{formatMoney(totalExpense)} TL</Text>
      </View>

      <View style={[styles.card, netBalance >= 0 ? styles.positiveCard : styles.negativeCard]}>
        <MaterialIcons
          name={netBalance >= 0 ? 'arrow-upward' : 'arrow-downward'}
          size={22}
          color={netBalance >= 0 ? '#10b981' : '#ef4444'}
        />
        <Text style={styles.cardLabel}>Net Bakiye</Text>
        <Text style={[styles.cardValue, { color: netBalance >= 0 ? '#10b981' : '#ef4444' }]}>
          {formatMoney(netBalance)} TL
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  incomeCard: {
    borderTopWidth: 3,
    borderTopColor: '#10b981',
  },
  expenseCard: {
    borderTopWidth: 3,
    borderTopColor: '#ef4444',
  },
  positiveCard: {
    borderTopWidth: 3,
    borderTopColor: '#10b981',
  },
  negativeCard: {
    borderTopWidth: 3,
    borderTopColor: '#ef4444',
  },
  cardLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
