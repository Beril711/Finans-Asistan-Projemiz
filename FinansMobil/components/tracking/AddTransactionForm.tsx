import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getCategories, addTransaction } from '@/services/trackingService';
import CategoryModal from './CategoryModal';
import type { Category } from '@/types';

const COLORS = {
  navyDark: '#0A2472', navyMid: '#1565C0', blue: '#1E88E5',
  cyan: '#29B6F6', cyanLight: '#90CAF9', bgLight: '#F0F4FF', cardBorder: '#BBDEFB',
  expense: '#1565C0', income: '#29B6F6',
};

interface Props { onTransactionAdded: () => void; }

export default function AddTransactionForm({ onTransactionAdded }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch { setCategories([]); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const filteredCategories = categories.filter((c) => c.type === transactionType);

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [transactionType, categories]);

  const handleSubmit = async () => {
    if (!categoryId) { Alert.alert('Hata', 'Lutfen bir kategori secin.'); return; }
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) { Alert.alert('Hata', 'Gecerli bir miktar girin.'); return; }
    if (!date) { Alert.alert('Hata', 'Tarih giriniz.'); return; }
    setLoading(true);
    try {
      await addTransaction({ category: categoryId, transaction_type: transactionType, amount: amountNum, date, description: description.trim() || undefined });
      setAmount(''); setDescription(''); setDate(new Date().toISOString().split('T')[0]);
      onTransactionAdded();
    } catch (error: any) {
      const data = error.response?.data;
      const msg = data ? (typeof data === 'string' ? data : Object.values(data).flat().join(' ')) : 'Islem eklenemedi.';
      Alert.alert('Hata', msg);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Islem Ekle</Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, transactionType === 'EXPENSE' && { backgroundColor: COLORS.expense, borderColor: COLORS.expense }]}
          onPress={() => setTransactionType('EXPENSE')}
        >
          <Text style={[styles.typeTxt, transactionType === 'EXPENSE' && styles.typeTxtActive]}>💸  Gider</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, transactionType === 'INCOME' && { backgroundColor: COLORS.income, borderColor: COLORS.income }]}
          onPress={() => setTransactionType('INCOME')}
        >
          <Text style={[styles.typeTxt, transactionType === 'INCOME' && styles.typeTxtActive]}>💰  Gelir</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={categoryId} onValueChange={(val) => setCategoryId(val)} style={styles.picker}>
          {filteredCategories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
      </View>
      <TouchableOpacity style={styles.addCategoryBtn} onPress={() => setShowCategoryModal(true)}>
        <Text style={styles.addCategoryTxt}>+ Yeni Kategori</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Miktar (TL)</Text>
      <TextInput style={styles.input} placeholder="0.00" placeholderTextColor={COLORS.cyanLight} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />

      <Text style={styles.label}>Tarih</Text>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.cyanLight} value={date} onChangeText={setDate} />

      <Text style={styles.label}>Aciklama (Opsiyonel)</Text>
      <TextInput style={styles.input} placeholder="Islem aciklamasi" placeholderTextColor={COLORS.cyanLight} value={description} onChangeText={setDescription} />

      <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitTxt}>Islem Ekle</Text>}
      </TouchableOpacity>

      <CategoryModal visible={showCategoryModal} onClose={() => setShowCategoryModal(false)} onCategoryAdded={fetchCategories} />
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
  title: { fontSize: 16, fontWeight: '700', color: COLORS.navyDark, marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  typeBtn: {
    flex: 1, padding: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    alignItems: 'center', backgroundColor: COLORS.bgLight,
  },
  typeTxt: { fontSize: 14, fontWeight: '700', color: COLORS.navyMid },
  typeTxtActive: { color: '#fff' },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.navyMid, marginBottom: 6 },
  pickerWrapper: {
    backgroundColor: COLORS.bgLight, borderWidth: 1,
    borderColor: COLORS.cardBorder, borderRadius: 10, marginBottom: 6, overflow: 'hidden',
  },
  picker: { height: 50, color: COLORS.navyDark },
  addCategoryBtn: { marginBottom: 14 },
  addCategoryTxt: { color: COLORS.blue, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.bgLight, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: 10, padding: 13, fontSize: 15, color: COLORS.navyDark, marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: COLORS.navyMid, padding: 15,
    borderRadius: 12, alignItems: 'center', marginTop: 4,
  },
  submitTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
});