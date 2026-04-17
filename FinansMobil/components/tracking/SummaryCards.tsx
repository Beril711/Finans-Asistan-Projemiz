import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  navyDark: '#0A2472', navyMid: '#1565C0', blue: '#1E88E5',
  cyan: '#29B6F6', cyanLight: '#90CAF9', bgLight: '#F0F4FF', cardBorder: '#BBDEFB',
};

interface Props {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export default function SummaryCards({ totalIncome, totalExpense, netBalance }: Props) {
  const fmt = (val: number) =>
    val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={styles.container}>
      <View style={[styles.card, { borderTopColor: COLORS.cyan }]}>
        <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
          <MaterialIcons name="trending-up" size={20} color={COLORS.cyan} />
        </View>
        <Text style={styles.cardLabel}>Toplam Gelir</Text>
        <Text style={[styles.cardValue, { color: COLORS.cyan }]}>₺{fmt(totalIncome)}</Text>
      </View>

      <View style={[styles.card, { borderTopColor: COLORS.navyMid }]}>
        <View style={[styles.iconCircle, { backgroundColor: '#E8EAF6' }]}>
          <MaterialIcons name="trending-down" size={20} color={COLORS.navyMid} />
        </View>
        <Text style={styles.cardLabel}>Toplam Gider</Text>
        <Text style={[styles.cardValue, { color: COLORS.navyMid }]}>₺{fmt(totalExpense)}</Text>
      </View>

      <View style={[styles.card, { borderTopColor: COLORS.blue }]}>
        <View style={[styles.iconCircle, { backgroundColor: '#E3F2FD' }]}>
          <MaterialIcons name={netBalance >= 0 ? 'arrow-upward' : 'arrow-downward'} size={20} color={COLORS.blue} />
        </View>
        <Text style={styles.cardLabel}>Net Bakiye</Text>
        <Text style={[styles.cardValue, { color: COLORS.blue }]}>₺{fmt(netBalance)}</Text>
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
  iconCircle: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  cardLabel: { fontSize: 10, color: COLORS.cyanLight, marginBottom: 4, fontWeight: '500' },
  cardValue: { fontSize: 12, fontWeight: '700' },
});