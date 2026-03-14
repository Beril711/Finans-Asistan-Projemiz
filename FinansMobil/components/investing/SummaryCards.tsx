import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface Props {
  balance: number;
  totalHoldingsValue: number;
  totalProfitLoss: number;
}

export default function InvestingSummaryCards({ balance, totalHoldingsValue, totalProfitLoss }: Props) {
  const formatMoney = (val: number) =>
    val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={styles.container}>
      <View style={[styles.card, styles.cashCard]}>
        <MaterialIcons name="account-balance-wallet" size={20} color="#667eea" />
        <Text style={styles.cardLabel}>Nakit</Text>
        <Text style={[styles.cardValue, { color: '#667eea' }]}>{formatMoney(balance)} TL</Text>
      </View>

      <View style={[styles.card, styles.portfolioCard]}>
        <MaterialIcons name="business-center" size={20} color="#f59e0b" />
        <Text style={styles.cardLabel}>Portfoy</Text>
        <Text style={[styles.cardValue, { color: '#f59e0b' }]}>
          {formatMoney(totalHoldingsValue)} TL
        </Text>
      </View>

      <View style={[styles.card, totalProfitLoss >= 0 ? styles.profitCard : styles.lossCard]}>
        <MaterialIcons
          name={totalProfitLoss >= 0 ? 'trending-up' : 'trending-down'}
          size={20}
          color={totalProfitLoss >= 0 ? '#10b981' : '#ef4444'}
        />
        <Text style={styles.cardLabel}>Kar/Zarar</Text>
        <Text
          style={[
            styles.cardValue,
            { color: totalProfitLoss >= 0 ? '#10b981' : '#ef4444' },
          ]}
        >
          {totalProfitLoss >= 0 ? '+' : ''}{formatMoney(totalProfitLoss)} TL
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
  cashCard: {
    borderTopWidth: 3,
    borderTopColor: '#667eea',
  },
  portfolioCard: {
    borderTopWidth: 3,
    borderTopColor: '#f59e0b',
  },
  profitCard: {
    borderTopWidth: 3,
    borderTopColor: '#10b981',
  },
  lossCard: {
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
    fontSize: 12,
    fontWeight: 'bold',
  },
});
