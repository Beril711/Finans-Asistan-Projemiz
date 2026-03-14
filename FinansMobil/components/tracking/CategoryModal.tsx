import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { addCategory } from '@/services/trackingService';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
}

export default function CategoryModal({ visible, onClose, onCategoryAdded }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Hata', 'Kategori adi giriniz.');
      return;
    }
    setLoading(true);
    try {
      await addCategory({ name: name.trim(), type });
      setName('');
      onCategoryAdded();
      onClose();
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.name?.[0] || 'Kategori eklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Yeni Kategori</Text>

          <Text style={styles.label}>Kategori Adi</Text>
          <TextInput
            style={styles.input}
            placeholder="Ornek: Market"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Tur</Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'EXPENSE' && styles.typeButtonActive]}
              onPress={() => setType('EXPENSE')}
            >
              <Text style={[styles.typeText, type === 'EXPENSE' && styles.typeTextActive]}>
                Gider
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'INCOME' && styles.typeButtonActiveGreen]}
              onPress={() => setType('INCOME')}
            >
              <Text style={[styles.typeText, type === 'INCOME' && styles.typeTextActive]}>
                Gelir
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Vazgec</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitText}>Ekle</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#333',
    marginBottom: 14,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  typeButtonActiveGreen: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  typeText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#667eea',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
});
