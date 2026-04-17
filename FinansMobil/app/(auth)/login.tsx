import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ActivityIndicator, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, StatusBar, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const COLORS = {
  navyDark: '#0A2472', navyMid: '#1565C0', blue: '#1E88E5',
  cyan: '#29B6F6', cyanLight: '#90CAF9', bgLight: '#F0F4FF', cardBorder: '#BBDEFB',
};

const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Kullanici adi ve sifre gereklidir.');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.detail || 'Giris basarisiz. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} translucent={false} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* Logo + Başlık */}
          <View style={styles.headerSection}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Finans Asistanım</Text>
            <Text style={styles.subtitle}>Finanslarınızı kolayca yönetin</Text>
          </View>

          {/* Form Kartı */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Giriş Yap</Text>

            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Kullanıcı adınızı girin"
              placeholderTextColor={COLORS.cyanLight}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="Şifrenizi girin"
              placeholderTextColor={COLORS.cyanLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Giris Yap</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.linkText}>
                Hesabınız yok mu? <Text style={styles.linkBold}>Kayıt Ol</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navyDark },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: STATUS_BAR_HEIGHT + 20 },

  headerSection: { alignItems: 'center', marginBottom: 36 },
  logoWrapper: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)',
  },
  logoImage: { width: 80, height: 80, borderRadius: 20 },
  appName: { fontSize: 30, fontWeight: '800', color: '#fff', marginBottom: 8, letterSpacing: 0.5 },
  subtitle: { fontSize: 15, color: COLORS.cyanLight },

  formCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 26,
    shadowColor: COLORS.navyDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16, elevation: 10,
  },
  formTitle: { fontSize: 22, fontWeight: '700', color: COLORS.navyDark, textAlign: 'center', marginBottom: 20 },

  errorBox: {
    backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12,
    marginBottom: 16, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  errorText: { color: COLORS.navyMid, fontSize: 13, textAlign: 'center' },

  label: { fontSize: 13, fontWeight: '600', color: COLORS.navyMid, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.bgLight, borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: 12, padding: 14, fontSize: 15, color: COLORS.navyDark, marginBottom: 14,
  },

  button: {
    backgroundColor: COLORS.navyMid, padding: 16,
    borderRadius: 12, alignItems: 'center', marginTop: 6,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 14, color: '#888' },
  linkBold: { color: COLORS.navyMid, fontWeight: '700' },
});