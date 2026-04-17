import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createInvestment } from '@/services/investmentService';
import type { Asset } from '@/types';

const COLORS = {
  navyDark: '#0A2472', navyMid: '#1565C0', blue: '#1E88E5',
  cyan: '#29B6F6', cyanLight: '#90CAF9', bgLight: '#F0F4FF', cardBorder: '#BBDEFB',
};

interface Props { assets: Asset[]; onTradeComplete: () => void; }

export default function TradeForm({ assets, onTradeComplete }: Props) {
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(assets.length > 0 ? assets[0].id : null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const price = selectedAsset ? Number(selectedAsset.current_price) : 0;
  const qty = parseFloat(quantity) || 0;
  const totalCost = price * qty;
  const fmt = (val: number) => val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSubmit = async () => {
    if (!selectedAssetId) { Alert.alert('Hata', 'Varlik seciniz.'); return; }
    if (qty <= 0) { Alert.alert('Hata', 'Gecerli bir miktar giriniz.'); return; }
    setLoading(true);
    try {
      await createInvestment({ asset: selectedAssetId, transaction_type: transactionType, quantity: qty });
      Alert.alert('Basarili', `${transactionType === 'BUY' ? 'Alim' : 'Satim'} islemi gerceklesti.`);
      setQuantity(''); onTradeComplete();
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.error || error.response?.data?.detail || 'Islem basarisiz.');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Islem Yap</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, transactionType === 'BUY' && { backgroundColor: COLORS.cyan, borderColor: COLORS.cyan }]}
          onPress={() => setTransactionType('BUY')}
        >
          <Text style={[styles.typeTxt, transactionType === 'BUY' && styles.typeTxtActive]}>AL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, transactionType === 'SELL' && { backgroundColor: COLORS.navyMid, borderColor: COLORS.navyMid }]}
          onPress={() => setTransactionType('SELL')}
        >
          <Text style={[styles.typeTxt, transactionType === 'SELL' && styles.typeTxtActive]}>SAT</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Varlik</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={selectedAssetId} onValueChange={(val) => setSelectedAssetId(val)} style={styles.picker}>
          {assets.map((a) => (
            <Picker.Item key={a.id} label={`${a.symbol} - ${a.name} (${fmt(Number(a.current_price))} TL)`} value={a.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Miktar</Text>
      <TextInput style={styles.input} placeholder="0" placeholderTextColor={COLORS.cyanLight} value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />

      {qty > 0 && selectedAsset && (
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Birim Fiyat:</Text>
            <Text style={styles.summaryValue}>₺{fmt(price)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Tutar:</Text>
            <Text style={[styles.summaryValue, { color: COLORS.cyan, fontWeight: '700' }]}>₺{fmt(totalCost)}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: transactionType === 'BUY' ? COLORS.cyan : COLORS.navyMid }, loading && { opacity: 0.7 }]}
        onPress={handleSubmit} disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={styles.submitTxt}>{transactionType === 'BUY' ? 'Satin Al' : 'Sat'}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 0.5, borderColor: COLORS.cardBorder,
    shadowColor: COLORS.navyDark, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.navyDark, marginBottom: 14 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  typeBtn: {
    flex: 1, padding: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    alignItems: 'center', backgroundColor: COLORS.bgLight,
  },
  typeTxt: { fontSize: 14, fontWeight: '700', color: COLORS.navyMid },
  typeTxtActive: { color: '#fff' },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.navyMid, marginBottom: 6 },
  pickerWrapper: {
    backgroundColor: COLORS.bgLight, borderWidth: 1,
    borderColor: COLORS.cardBorder, borderRadius: 10, marginBottom: 12, overflow: 'hidden',
  },
  picker: { height: 50, color: COLORS.navyDark },
  input: {
    backgroundColor: COLORS.bgLight, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: 10, padding: 12, fontSize: 15, color: COLORS.navyDark, marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: COLORS.bgLight, borderRadius: 10,
    padding: 12, marginBottom: 12, borderWidth: 0.5, borderColor: COLORS.cardBorder,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  summaryLabel: { fontSize: 13, color: COLORS.cyanLight },
  summaryValue: { fontSize: 13, fontWeight: '600', color: COLORS.navyDark },
  submitBtn: { padding: 14, borderRadius: 12, alignItems: 'center' },
  submitTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});