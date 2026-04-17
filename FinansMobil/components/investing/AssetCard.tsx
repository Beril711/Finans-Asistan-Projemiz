import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Asset } from '@/types';

const typeColors: Record<string, string> = {
  CRYPTO: '#F59E0B',
  STOCK: '#1565C0',
  FOREX: '#7C3AED',
};

const typeLabels: Record<string, string> = {
  CRYPTO: 'C',
  STOCK: 'S',
  FOREX: 'F',
};

interface Props { asset: Asset; }

export default function AssetCard({ asset }: Props) {
  const price = Number(asset.current_price);
  const fmt = (val: number) => val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const bgColor = asset.priceChange === 'up' ? '#E8F5E9' : asset.priceChange === 'down' ? '#FFF8E1' : '#fff';
  const borderColor = asset.priceChange === 'up' ? '#A5D6A7' : asset.priceChange === 'down' ? '#FFE082' : '#BBDEFB';

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
      <View style={[styles.badge, { backgroundColor: typeColors[asset.asset_type] || '#999' }]}>
        <Text style={styles.badgeText}>{typeLabels[asset.asset_type] || '?'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.symbol}>{asset.symbol}</Text>
        <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
      </View>
      <View style={styles.priceCol}>
        <Text style={styles.price}>{fmt(price)} TL</Text>
        {asset.priceChange && (
          <Text style={[styles.change, { color: asset.priceChange === 'up' ? '#43A047' : '#E53935' }]}>
            {asset.priceChange === 'up' ? '▲ +' : '▼ -'}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 0.5,
    shadowColor: '#0A2472', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  badge: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  info: { flex: 1 },
  symbol: { fontSize: 15, fontWeight: '700', color: '#0A2472' },
  name: { fontSize: 12, color: '#90CAF9', marginTop: 2 },
  priceCol: { alignItems: 'flex-end' },
  price: { fontSize: 14, fontWeight: '700', color: '#0A2472' },
  change: { fontSize: 11, fontWeight: '600', marginTop: 2 },
});