import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Holding } from '@/types';

interface Props {
  holdings: Holding[];
}

export default function PortfolioTab({ holdings }: Props) {
  const formatMoney = (val: number | string) =>
    Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (holdings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Portfoyunuzde varlik bulunmuyor</Text>
        <Text style={styles.emptySubtext}>Piyasa sekmesinden varlik satin alabilirsiniz</Text>
      </View>
    );
  }

  return (
    <View>
      {holdings.map((holding) => {
        const profitPositive = holding.profit_loss >= 0;
        return (
          <View key={holding.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.symbol}>{holding.asset_symbol}</Text>
              <Text style={styles.name}>{holding.asset_name}</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Miktar</Text>
                <Text style={styles.detailValue}>
                  {Number(holding.quantity).toFixed(4)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Ort. Maliyet</Text>
                <Text style={styles.detailValue}>{formatMoney(holding.average_price)} TL</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Guncel Fiyat</Text>
                <Text style={styles.detailValue}>{formatMoney(holding.current_price)} TL</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Toplam Deger</Text>
                <Text style={styles.detailValue}>{formatMoney(holding.current_value)} TL</Text>
              </View>
            </View>

            <View
              style={[
                styles.plBadge,
                { backgroundColor: profitPositive ? '#dcfce7' : '#fee2e2' },
              ]}
            >
              <Text
                style={[styles.plText, { color: profitPositive ? '#10b981' : '#ef4444' }]}
              >
                {profitPositive ? '+' : ''}{formatMoney(holding.profit_loss)} TL
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  name: {
    fontSize: 13,
    color: '#888',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  detailItem: {
    width: '47%',
  },
  detailLabel: {
    fontSize: 11,
    color: '#999',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  plBadge: {
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  plText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
