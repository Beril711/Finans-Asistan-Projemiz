import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
export default function App() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // DİKKAT: Buraya 'ipconfig' ile bulduğun KENDİ IP ADRESİNİ yaz!
  // Örnek: 'http://192.168.1.35:8000/api/token/'
  const API_URL = 'http://10.45.161.148:8000/api/token/';

  const handleLogin = async () => {
    // Basit validasyon
    if (!username || !password) {
      Alert.alert("Hata", "Lütfen kullanıcı adı ve şifre girin.");
      return;
    }

    setLoading(true);
    try {
      console.log("İstek atılıyor:", API_URL); // Hata ayıklama için

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Başarılı 🎉", "Giriş yapıldı! Token: " + data.access.substring(0, 10) + "...");
        // Başarılı girişten sonra Dashboard'a git
        setTimeout(() => {
          router.replace('/dashboard');
        }, 1000);
        // İleride burada ana sayfaya yönlendirme yapacağız.
      } else {
        Alert.alert("Giriş Başarısız", "Kullanıcı adı veya şifre hatalı.");
      }
    } catch (error) {
      Alert.alert("Bağlantı Hatası", "Sunucuya ulaşılamadı. Lütfen IP adresini ve Django sunucusunun çalıştığını kontrol et.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Finans Asistanım 📱</Text>
        <Text style={styles.subtitle}>Hoş Geldiniz</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="Kullanıcı adınız"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="******"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Giriş Yap</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 8,
    fontWeight: '600',
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    backgroundColor: '#4299e1', // Vue projesindeki mavi ton
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: "#4299e1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});