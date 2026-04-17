import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AssetCard from './AssetCard';
import TradeForm from './TradeForm';
import type { Asset } from '@/types';

interface Props { assets: Asset[]; onTradeComplete: () => void; }

export default function MarketTab({ assets, onTradeComplete }: Props) {
  return (
    <View>
      <TradeForm assets={assets} onTradeComplete={onTradeComplete} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Piyasa Fiyatlari</Text>
        {assets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 4 },
  sectionTitle: {
    fontSize: 16, fontWeight: '700',
    color: '#0A2472', marginBottom: 12,
  },
});