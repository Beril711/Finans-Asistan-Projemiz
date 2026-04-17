import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  navyDark: '#0A2472', navyMid: '#1565C0', blue: '#1E88E5',
  cyan: '#29B6F6', cyanLight: '#90CAF9', bgLight: '#F0F4FF', cardBorder: '#BBDEFB',
};

interface Props {
  balance: number;
  totalHoldingsValue: number;
  totalProfitLoss: number;
}

export default function InvestingSummaryCards({ balance, totalHoldingsValue, totalProfitLoss }: Props) {
  const fmt = (val: number) => val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderTopColor: COLORS.navyMid }]}>
        <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
          <MaterialIcons name="account-balance-wallet" size={18} color={COLORS.navyMid} />
        </View>
        <Text style={styles.cardLabel}>Nakit</Text>
        <Text style={[styles.cardValue, { color: COLORS.navyMid }]}>₺{fmt(balance)}</Text>
      </View>

      <View style={[styles.card, { borderTopColor: COLORS.blue }]}>
        <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
          <MaterialIcons name="business-center" size={18} color={COLORS.blue} />
        </View>
        <Text style={styles.cardLabel}>Portfoy</Text>
        <Text style={[styles.cardValue, { color: COLORS.blue }]}>₺{fmt(totalHoldingsValue)}</Text>
      </View>

      <View style={[styles.card, { borderTopColor: totalProfitLoss >= 0 ? COLORS.cyan : COLORS.navyMid }]}>
        <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
          <MaterialIcons name={totalProfitLoss >= 0 ? 'trending-up' : 'trending-down'} size={18} color={totalProfitLoss >= 0 ? COLORS.cyan : COLORS.navyMid} />
        </View>
        <Text style={styles.cardLabel}>Kar/Zarar</Text>
        <Text style={[styles.cardValue, { color: totalProfitLoss >= 0 ? COLORS.cyan : COLORS.navyMid }]}>
          {totalProfitLoss >= 0 ? '+' : ''}₺{fmt(totalProfitLoss)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  card: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12,
    alignItems: 'center', borderTopWidth: 3,
    borderWidth: 0.5, borderColor: COLORS.cardBorder,
    shadowColor: COLORS.navyDark, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  iconCircle: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  cardLabel: { fontSize: 10, color: COLORS.cyanLight, marginBottom: 4, fontWeight: '500' },
  cardValue: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
});