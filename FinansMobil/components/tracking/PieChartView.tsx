import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

interface Props {
  income: number;
  expense: number;
}

export default function PieChartView({ income, expense }: Props) {
  const screenWidth = Dimensions.get('window').width - 56;

  if (income === 0 && expense === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Henuz islem bulunmuyor</Text>
      </View>
    );
  }

  const data = [
    {
      name: 'Gelir',
      amount: income,
      color: '#10b981',
      legendFontColor: '#555',
      legendFontSize: 13,
    },
    {
      name: 'Gider',
      amount: expense,
      color: '#ef4444',
      legendFontColor: '#555',
      legendFontSize: 13,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gelir / Gider Dagilimi</Text>
      <PieChart
        data={data}
        width={screenWidth}
        height={180}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
});
