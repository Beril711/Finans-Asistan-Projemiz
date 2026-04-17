import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const COLORS = {
  navyDark: '#0A2472', navyMid: '#1565C0', cyan: '#29B6F6',
  cyanLight: '#90CAF9', bgLight: '#F0F4FF', cardBorder: '#BBDEFB',
};

interface Props { income: number; expense: number; }

export default function PieChartView({ income, expense }: Props) {
  const screenWidth = Dimensions.get('window').width - 56;
  const total = income + expense;
  const incomePercent = total > 0 ? Math.round((income / total) * 100) : 0;
  const expensePercent = total > 0 ? Math.round((expense / total) * 100) : 0;

  if (income === 0 && expense === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <MaterialIcons name="pie-chart" size={32} color={COLORS.cyanLight} />
        </View>
        <Text style={styles.emptyTitle}>Grafik için veri yok</Text>
        <Text style={styles.emptySubtitle}>İşlem ekledikçe grafik oluşacak</Text>
      </View>
    );
  }

  const data = [
    { name: '', amount: income, color: COLORS.cyan, legendFontColor: 'transparent', legendFontSize: 1 },
    { name: '', amount: expense, color: COLORS.navyMid, legendFontColor: 'transparent', legendFontSize: 1 },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gelir / Gider Dağılımı</Text>
      <View style={styles.chartWrapper}>
        <PieChart
          data={data}
          width={screenWidth}
          height={200}
          chartConfig={{ color: (opacity = 1) => `rgba(10, 36, 114, ${opacity})` }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="60"
          absolute
          hasLegend={false}
        />
      </View>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.cyan }]} />
          <Text style={styles.legendTxt}>Gelir</Text>
          <Text style={[styles.legendPercent, { color: COLORS.cyan }]}>%{incomePercent}</Text>
        </View>
        <View style={styles.legendDivider} />
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.navyMid }]} />
          <Text style={styles.legendTxt}>Gider</Text>
          <Text style={[styles.legendPercent, { color: COLORS.navyMid }]}>%{expensePercent}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.cardBorder,
    shadowColor: COLORS.navyDark, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.navyDark, marginBottom: 4, alignSelf: 'flex-start' },
  chartWrapper: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  legendRow: {
    flexDirection: 'row', width: '100%', backgroundColor: COLORS.bgLight,
    borderRadius: 12, padding: 12, marginTop: 8,
    borderWidth: 0.5, borderColor: COLORS.cardBorder,
  },
  legendItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  legendDivider: { width: 0.5, backgroundColor: COLORS.cardBorder },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendTxt: { fontSize: 13, color: COLORS.navyDark, fontWeight: '500' },
  legendPercent: { fontSize: 15, fontWeight: '700' },
  emptyContainer: {
    backgroundColor: '#fff', borderRadius: 16, padding: 28, marginBottom: 16,
    alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: COLORS.cardBorder,
  },
  emptyIconCircle: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: COLORS.bgLight, justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: COLORS.navyDark },
  emptySubtitle: { fontSize: 12, color: COLORS.cyanLight },
});