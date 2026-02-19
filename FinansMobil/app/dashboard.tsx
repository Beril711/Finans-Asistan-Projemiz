// FinansMobil/app/dashboard.tsx

import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [detectedAmount, setDetectedAmount] = useState<string | null>(null);

  // BURAYA KENDİ GÜNCEL IP ADRESİNİ YAZ (ipconfig ile kontrol et)
  const API_URL = 'http://10.45.161.148:8000/api/scan-receipt/';

  // 1. Kamera İzni ve Fotoğraf Çekme
  const pickImageAndScan = async () => {
    // İzin iste
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Hata', 'Kamera izni vermeniz gerekiyor!');
      return;
    }

    // Kamerayı aç
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Fotoğrafı kırpma özelliği
      aspect: [4, 3],
      quality: 0.8, // Çok yüksek kaliteye gerek yok, 0.8 ideal
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      uploadImage(result.assets[0].uri); // Fotoğraf çekilince sunucuya gönder
    }
  };

  // 2. Fotoğrafı Backend'e Gönderme (Upload)
  const uploadImage = async (uri: string) => {
    setLoading(true);
    setResultText('');
    setDetectedAmount(null);

    // Form verisi oluştur (Django buna ihtiyaç duyar)
    let formData = new FormData();
    formData.append('image', {
      uri: uri,
      name: 'receipt.jpg',
      type: 'image/jpeg',
    } as any); // TypeScript hatasını geçmek için 'as any' kullandık

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResultText(data.raw_text); // Okunan ham metin
        setDetectedAmount(data.detected_total.toString()); // Bulunan fiyat
        Alert.alert("Başarılı! 🎉", `Fiş Okundu!\nTahmini Tutar: ${data.detected_total} TL`);
      } else {
        Alert.alert("Hata", "Fiş okunamadı veya metin bulunamadı.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Bağlantı Hatası", "Sunucuya gönderilemedi. Backend'i ve IP'yi kontrol et.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Harcama Asistanı 🤖</Text>
        
        <View style={styles.card}>
          <Text style={styles.infoText}>
            Market fişini veya faturayı taratarak harcamayı otomatik ekleyin.
          </Text>

          {/* Kamera Butonu */}
          <TouchableOpacity style={styles.scanButton} onPress={pickImageAndScan} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.scanButtonText}>📸 Fişi Tara</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sonuç Gösterimi */}
        {image && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Tarama Sonucu</Text>
            <Image source={{ uri: image }} style={styles.previewImage} />
            
            {detectedAmount && (
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Bulunan Tutar:</Text>
                <Text style={styles.amountValue}>{detectedAmount} TL</Text>
              </View>
            )}

            {resultText ? (
              <View style={styles.textBox}>
                 <Text style={styles.textLabel}>Okunan Metin:</Text>
                 <Text style={styles.rawText}>{resultText.substring(0, 200)}...</Text>
              </View>
            ) : null}
          </View>
        )}
        
        {/* Çıkış Butonu */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/')}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc' },
  scrollContent: { padding: 20, alignItems: 'center' },
  header: { fontSize: 28, fontWeight: 'bold', color: '#2d3748', marginBottom: 20, marginTop: 20 },
  card: { width: '100%', backgroundColor: '#fff', padding: 20, borderRadius: 15, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginBottom: 20 },
  infoText: { fontSize: 16, color: '#718096', textAlign: 'center', marginBottom: 20 },
  scanButton: { backgroundColor: '#4299e1', padding: 15, borderRadius: 10, alignItems: 'center' },
  scanButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultCard: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 15, alignItems: 'center', elevation: 3 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#2d3748' },
  previewImage: { width: 200, height: 200, borderRadius: 10, marginBottom: 15, resizeMode: 'contain' },
  amountBox: { backgroundColor: '#c6f6d5', padding: 10, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 10 },
  amountLabel: { color: '#276749', fontWeight: 'bold' },
  amountValue: { color: '#22543d', fontSize: 24, fontWeight: 'bold' },
  textBox: { width: '100%', backgroundColor: '#edf2f7', padding: 10, borderRadius: 8 },
  textLabel: { fontWeight: 'bold', marginBottom: 5, color: '#4a5568' },
  rawText: { fontSize: 12, color: '#4a5568' },
  logoutButton: { marginTop: 30 },
  logoutText: { color: '#e53e3e', fontSize: 16, fontWeight: '600' }
});