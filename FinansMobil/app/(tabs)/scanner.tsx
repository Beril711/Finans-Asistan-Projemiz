import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Image, SafeAreaView, ScrollView,
  ActivityIndicator, Alert, StatusBar, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import api from '@/services/api';
import type { ScanReceiptResponse } from '@/types';
import { addTransaction, getCategories, addCategory } from '@/services/trackingService';

const COLORS = {
  navyDark: '#0A2472', navyMid: '#1565C0', cyan: '#29B6F6',
  cyanLight: '#90CAF9', bgLight: '#F0F4FF', cardBg: '#FFFFFF',
  cardBorder: '#BBDEFB', success: '#43A047', danger: '#E53935',
};
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

export default function ScannerScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanReceiptResponse | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Izin Gerekli', 'Kamera erisim izni gereklidir.'); return; }
    const pickerResult = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const uri = pickerResult.assets[0].uri;
      setImage(uri); setResult(null); await uploadImage(uri);
    }
  };

  const pickFromGallery = async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    if (!pickerResult.canceled && pickerResult.assets[0]) {
      const uri = pickerResult.assets[0].uri;
      setImage(uri); setResult(null); await uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', { uri, name: 'receipt.jpg', type: 'image/jpeg' } as any);
      const response = await api.post<ScanReceiptResponse>('/scan-receipt/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(response.data);
      if (response.data.detected_total && response.data.detected_total > 0) {
        try {
          const catResponse = await getCategories();
          let category = catResponse.data.find((c) => c.name.toLowerCase() === 'diger' || c.name.toLowerCase() === 'diğer');
          if (!category) { const newCat = await addCategory({ name: 'Diger', type: 'EXPENSE' }); category = newCat.data; }
          await addTransaction({ transaction_type: 'EXPENSE', amount: response.data.detected_total, category: category.id, date: new Date().toISOString().split('T')[0], description: 'Fis tarayici ile eklendi' });
          Alert.alert('Basarili', `${response.data.detected_total} TL gider olarak eklendi!`);
        } catch (e) { console.log('Gider eklenirken hata:', e); }
      }
    } catch { Alert.alert('Hata', 'Fis taranamiyor. Tekrar deneyin.'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/')}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Fis Tarayici</Text>
          <Text style={styles.headerSubtitle}>Fislerinizi tarayin, tutari otomatik tespit edin</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <View style={styles.actionIconCircle}>
              <MaterialIcons name="camera-alt" size={28} color={COLORS.navyMid} />
            </View>
            <Text style={styles.actionText}>Kamera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={pickFromGallery}>
            <View style={styles.actionIconCircle}>
              <MaterialIcons name="photo-library" size={28} color={COLORS.navyMid} />
            </View>
            <Text style={styles.actionText}>Galeri</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.navyMid} />
            <Text style={styles.loadingText}>Fis taraniyor...</Text>
          </View>
        )}

        {image && !loading && (
          <View style={styles.previewCard}>
            <Text style={styles.sectionTitle}>Taranan Fis</Text>
            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="contain" />
          </View>
        )}

        {result && !loading && (
          <View style={styles.resultCard}>
            <Text style={styles.sectionTitle}>Tarama Sonucu</Text>
            {result.detected_total ? (
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Tespit Edilen Tutar</Text>
                <Text style={styles.totalValue}>
                  {Number(result.detected_total).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
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
                <Text style={styles.rawText}>{result.raw_text.substring(0, 500)}{result.raw_text.length > 500 ? '...' : ''}</Text>
              </View>
            ) : null}
          </View>
        )}

        {!image && !loading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="receipt-long" size={48} color={COLORS.cyanLight} />
            </View>
            <Text style={styles.emptyTitle}>Fis Tarayin</Text>
            <Text style={styles.emptySubtitle}>Kamera veya galeri kullanarak fisinizi tarayin</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navyDark },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: STATUS_BAR_HEIGHT + 16, paddingBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: COLORS.cyanLight, marginTop: 2 },
  content: { flex: 1, backgroundColor: COLORS.bgLight, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  contentInner: { padding: 16, paddingBottom: 32 },
  actionRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  actionButton: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 20, alignItems: 'center', gap: 10, borderWidth: 0.5, borderColor: COLORS.cardBorder, elevation: 2 },
  actionIconCircle: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  actionText: { fontSize: 14, fontWeight: '600', color: COLORS.navyDark },
  loadingBox: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 32, alignItems: 'center', gap: 12, marginBottom: 16, borderWidth: 0.5, borderColor: COLORS.cardBorder },
  loadingText: { color: COLORS.navyMid, fontSize: 14 },
  previewCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: COLORS.cardBorder },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navyDark, marginBottom: 12 },
  previewImage: { width: '100%', height: 250, borderRadius: 10 },
  resultCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 0.5, borderColor: COLORS.cardBorder },
  totalBox: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 0.5, borderColor: '#A5D6A7' },
  totalLabel: { fontSize: 13, color: COLORS.success, marginBottom: 4, fontWeight: '500' },
  totalValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.success },
  noTotalBox: { backgroundColor: '#FFF8E1', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  noTotalText: { color: '#F57C00', fontSize: 14 },
  rawTextBox: { backgroundColor: COLORS.bgLight, borderRadius: 10, padding: 12 },
  rawTextLabel: { fontSize: 13, fontWeight: '600', color: COLORS.navyMid, marginBottom: 6 },
  rawText: { fontSize: 12, color: '#555', lineHeight: 18 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 14 },
  emptyIconCircle: { width: 90, height: 90, borderRadius: 24, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.navyDark },
  emptySubtitle: { fontSize: 14, color: COLORS.cyanLight, textAlign: 'center' },
});