import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Asset } from '@/types';

interface Props {
  asset: Asset;
}

const typeIcons: Record<string, string> = {
  CRYPTO: 'C',
  STOCK: 'S',
  FOREX: 'F',
};

const typeColors: Record<string, string> = {
  CRYPTO: '#f59e0b',
  STOCK: '#3b82f6',
  FOREX: '#8b5cf6',
};

export default function AssetCard({ asset }: Props) {
  const price = Number(asset.current_price);
  const formatMoney = (val: number) =>
    val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const bgColor =
    asset.priceChange === 'up'
      ? '#dcfce7'
      : asset.priceChange === 'down'
      ? '#fef3c7'
      : '#fff';

  return (
    <View style={[styles.card, { backgroundColor: bgColor }]}>
      <View style={styles.row}>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: typeColors[asset.asset_type] || '#999' },
          ]}
        >
          <Text style={styles.typeBadgeText}>
            {typeIcons[asset.asset_type] || '?'}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.symbol}>{asset.symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {asset.name}
          </Text>
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.price}>{formatMoney(price)} TL</Text>
          {asset.priceChange && (
            <Text
              style={{
                fontSize: 11,
                color: asset.priceChange === 'up' ? '#10b981' : '#ef4444',
                fontWeight: '600',
              }}
            >
              {asset.priceChange === 'up' ? '  +' : '  -'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  typeBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  info: {
    flex: 1,
  },
  symbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  name: {
    fontSize: 12,
    color: '#888',
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});
