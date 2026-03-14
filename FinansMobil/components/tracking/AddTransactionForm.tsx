import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getCategories, addTransaction } from '@/services/trackingService';
import CategoryModal from './CategoryModal';
import type { Category } from '@/types';

interface Props {
  onTransactionAdded: () => void;
}

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
      const data = Array.isArray(res.data) ? res.data : [];
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) => c.type === transactionType);

  useEffect(() => {
    if (filteredCategories.length > 0 && !filteredCategories.find((c) => c.id === categoryId)) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [transactionType, categories]);

  const handleSubmit = async () => {
    if (!categoryId) {
      Alert.alert('Hata', 'Lutfen bir kategori secin.');
      return;
    }
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Hata', 'Gecerli bir miktar girin.');
      return;
    }
    if (!date) {
      Alert.alert('Hata', 'Tarih giriniz.');
      return;
    }

    setLoading(true);
    try {
      await addTransaction({
        category: categoryId,
        transaction_type: transactionType,
        amount: amountNum,
        date,
        description: description.trim() || undefined,
      });
      setAmount('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      onTransactionAdded();
    } catch (error: any) {
      const data = error.response?.data;
      const msg = data
        ? typeof data === 'string'
          ? data
          : Object.values(data).flat().join(' ')
        : 'Islem eklenemedi.';
      Alert.alert('Hata', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yeni Islem Ekle</Text>

      {/* Transaction Type */}
      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeButton, transactionType === 'EXPENSE' && styles.expenseActive]}
          onPress={() => setTransactionType('EXPENSE')}
        >
          <Text style={[styles.typeText, transactionType === 'EXPENSE' && styles.typeTextActive]}>
            Gider
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, transactionType === 'INCOME' && styles.incomeActive]}
          onPress={() => setTransactionType('INCOME')}
        >
          <Text style={[styles.typeText, transactionType === 'INCOME' && styles.typeTextActive]}>
            Gelir
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Picker */}
      <Text style={styles.label}>Kategori</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={categoryId}
          onValueChange={(val) => setCategoryId(val)}
          style={styles.picker}
        >
          {filteredCategories.map((cat) => (
            <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.addCategoryButton}
        onPress={() => setShowCategoryModal(true)}
      >
        <Text style={styles.addCategoryText}>+ Yeni Kategori</Text>
      </TouchableOpacity>

      {/* Amount */}
      <Text style={styles.label}>Miktar (TL)</Text>
      <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor="#999"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      {/* Date */}
      <Text style={styles.label}>Tarih</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#999"
        value={date}
        onChangeText={setDate}
      />

      {/* Description */}
      <Text style={styles.label}>Aciklama (Opsiyonel)</Text>
      <TextInput
        style={styles.input}
        placeholder="Islem aciklamasi"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
      />

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, loading && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Islem Ekle</Text>
        )}
      </TouchableOpacity>

      <CategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryAdded={fetchCategories}
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
  expenseActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  incomeActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 6,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  addCategoryButton: {
    marginBottom: 14,
  },
  addCategoryText: {
    color: '#667eea',
    fontSize: 13,
    fontWeight: '600',
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
  submitButton: {
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
