import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import api from '@/services/api';
import type { ScanReceiptResponse } from '@/types';
import { addTransaction, getCategories, addCategory } from '@/services/trackingService';

export default function ScannerScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanReceiptResponse | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Gerekli', 'Kamera erisim izni gereklidir.');
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const uri = pickerResult.assets[0].uri;
      setImage(uri);
      setResult(null);
      await uploadImage(uri);
    }
  };

  const pickFromGallery = async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const uri = pickerResult.assets[0].uri;
      setImage(uri);
      setResult(null);
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'receipt.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await api.post<ScanReceiptResponse>('/scan-receipt/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);

      // Tutar tespit edildiyse otomatik gider ekle
      if (response.data.detected_total && response.data.detected_total > 0) {
        try {
          // Kategorileri getir, "Diger" kategorisini bul veya oluştur
          const catResponse = await getCategories();
          let category = catResponse.data.find(
            (c) => c.name.toLowerCase() === 'diger' || c.name.toLowerCase() === 'diğer'
          );

          if (!category) {
            const newCat = await addCategory({ name: 'Diger', type: 'EXPENSE' });
            category = newCat.data;
          }

          // Gider ekle
          await addTransaction({
            transaction_type: 'EXPENSE',
            amount: response.data.detected_total,
            category: category.id,
            date: new Date().toISOString().split('T')[0],
            description: 'Fis tarayici ile eklendi',
          });

          Alert.alert('Basarili', `${response.data.detected_total} TL gider olarak eklendi!`);
        } catch (e) {
          console.log('Gider eklenirken hata:', e);
        }
      }
    } catch (error: any) {
      Alert.alert('Hata', 'Fis taranamiyor. Tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fis Tarayici</Text>
        <Text style={styles.headerSubtitle}>Fislerinizi tarayin, tutari otomatik tespit edin</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <MaterialIcons name="camera-alt" size={28} color="#667eea" />
            <Text style={styles.actionText}>Kamera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={pickFromGallery}>
            <MaterialIcons name="photo-library" size={28} color="#667eea" />
            <Text style={styles.actionText}>Galeri</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#667eea" />
            <Text style={styles.loadingText}>Fis taraniyor...</Text>
          </View>
        )}

        {/* Image Preview */}
        {image && !loading && (
          <View style={styles.previewCard}>
            <Text style={styles.sectionTitle}>Taranan Fis</Text>
            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="contain" />
          </View>
        )}

        {/* Result */}
        {result && !loading && (
          <View style={styles.resultCard}>
            <Text style={styles.sectionTitle}>Tarama Sonucu</Text>

            {result.detected_total ? (
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Tespit Edilen Tutar</Text>
                <Text style={styles.totalValue}>
                  {Number(result.detected_total).toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  TL
                </Text>
              </View>
            ) : (
              <View style={styles.noTotalBox}>
                <Text style={styles.noTotalText}>Tutar tespit edilemedi</Text>
              </View>
            )}

            {result.raw_text ? (
              <View style={styles.rawTextBox}>
                <Text style={styles.rawTextLabel}>Ham Metin</Text>
                <Text style={styles.rawText}>
                  {result.raw_text.substring(0, 500)}
                  {result.raw_text.length > 500 ? '...' : ''}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Empty State */}
        {!image && !loading && (
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Fis Tarayin</Text>
            <Text style={styles.emptySubtitle}>
              Kamera veya galeri kullanarak fisinizi tarayin
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  contentInner: {
    padding: 16,
    paddingBottom: 32,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  loadingBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  totalBox: {
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 13,
    color: '#16a34a',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  noTotalBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  noTotalText: {
    color: '#d97706',
    fontSize: 14,
  },
  rawTextBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
  },
  rawTextLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  rawText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});