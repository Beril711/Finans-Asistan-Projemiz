import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Investment } from '@/types';

interface Props {
  investments: Investment[];
}

export default function HistoryTab({ investments }: Props) {
  const formatMoney = (val: number | string) =>
    Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (investments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Henuz islem gecmisiniz yok</Text>
      </View>
    );
  }

  return (
    <View>
      {investments.map((inv) => {
        const isBuy = inv.transaction_type === 'BUY';
        return (
          <View
            key={inv.id}
            style={[
              styles.card,
              { borderLeftColor: isBuy ? '#10b981' : '#ef4444' },
            ]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.typeBadge,
                  { backgroundColor: isBuy ? '#dcfce7' : '#fee2e2' },
                ]}
              >
                <Text
                  style={{
                    color: isBuy ? '#10b981' : '#ef4444',
                    fontSize: 11,
                    fontWeight: 'bold',
                  }}
                >
                  {isBuy ? 'ALIM' : 'SATIM'}
                </Text>
              </View>
              <Text style={styles.dateText}>
                {new Date(inv.date).toLocaleDateString('tr-TR')}
              </Text>
            </View>

            <Text style={styles.assetText}>
              {inv.asset_symbol} - {inv.asset_name}
            </Text>

            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Miktar</Text>
                <Text style={styles.detailValue}>{Number(inv.quantity).toFixed(4)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Birim Fiyat</Text>
                <Text style={styles.detailValue}>{formatMoney(inv.price)} TL</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Toplam</Text>
                <Text style={[styles.detailValue, { fontWeight: 'bold' }]}>
                  {formatMoney(inv.total)} TL
                </Text>
              </View>
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
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
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
  assetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {},
  detailLabel: {
    fontSize: 11,
    color: '#999',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
});
