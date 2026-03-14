import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { createInvestment } from '@/services/investmentService';
import type { Asset } from '@/types';

interface Props {
  assets: Asset[];
  onTradeComplete: () => void;
}

export default function TradeForm({ assets, onTradeComplete }: Props) {
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL'>('BUY');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(
    assets.length > 0 ? assets[0].id : null
  );
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);
  const price = selectedAsset ? Number(selectedAsset.current_price) : 0;
  const qty = parseFloat(quantity) || 0;
  const totalCost = price * qty;

  const formatMoney = (val: number) =>
    val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSubmit = async () => {
    if (!selectedAssetId) {
      Alert.alert('Hata', 'Varlik seciniz.');
      return;
    }
    if (qty <= 0) {
      Alert.alert('Hata', 'Gecerli bir miktar giriniz.');
      return;
    }

    setLoading(true);
    try {
      await createInvestment({
        asset: selectedAssetId,
        transaction_type: transactionType,
        quantity: qty,
      });
      Alert.alert('Basarili', `${transactionType === 'BUY' ? 'Alim' : 'Satim'} islemi gerceklesti.`);
      setQuantity('');
      onTradeComplete();
    } catch (error: any) {
      const msg = error.response?.data?.error || error.response?.data?.detail || 'Islem basarisiz.';
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Islem Yap</Text>

      {/* Buy / Sell Toggle */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeButton, transactionType === 'BUY' && styles.buyActive]}
          onPress={() => setTransactionType('BUY')}
        >
          <Text style={[styles.typeText, transactionType === 'BUY' && styles.typeTextActive]}>
            AL
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, transactionType === 'SELL' && styles.sellActive]}
          onPress={() => setTransactionType('SELL')}
        >
          <Text style={[styles.typeText, transactionType === 'SELL' && styles.typeTextActive]}>
            SAT
          </Text>
        </TouchableOpacity>
      </View>

      {/* Asset Picker */}
      <Text style={styles.label}>Varlik</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedAssetId}
          onValueChange={(val) => setSelectedAssetId(val)}
          style={styles.picker}
        >
          {assets.map((a) => (
            <Picker.Item
              key={a.id}
              label={`${a.symbol} - ${a.name} (${formatMoney(Number(a.current_price))} TL)`}
              value={a.id}
            />
          ))}
        </Picker>
      </View>

      {/* Quantity */}
      <Text style={styles.label}>Miktar</Text>
      <TextInput
        style={styles.input}
        placeholder="0"
        placeholderTextColor="#999"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
      />

      {/* Summary */}
      {qty > 0 && selectedAsset && (
        <View style={styles.summaryBox}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Birim Fiyat:</Text>
            <Text style={styles.summaryValue}>{formatMoney(price)} TL</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Toplam Tutar:</Text>
            <Text style={[styles.summaryValue, styles.summaryTotal]}>
              {formatMoney(totalCost)} TL
            </Text>
          </View>
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: transactionType === 'BUY' ? '#10b981' : '#ef4444' },
          loading && { opacity: 0.7 },
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            {transactionType === 'BUY' ? 'Satin Al' : 'Sat'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 14,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  buyActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  sellActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  typeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  typeTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
  pickerWrapper: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  summaryBox: {
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  summaryTotal: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  submitButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
