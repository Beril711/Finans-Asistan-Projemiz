import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, RefreshControl,
  Modal, TextInput, StatusBar, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getPortfolio, getAssets, getHoldings, getInvestments, resetPortfolio, depositBalance } from '@/services/investmentService';
import InvestingSummaryCards from '@/components/investing/SummaryCards';
import MarketTab from '@/components/investing/MarketTab';
import PortfolioTab from '@/components/investing/PortfolioTab';
import HistoryTab from '@/components/investing/HistoryTab';
import type { Portfolio, Asset, Holding, Investment } from '@/types';

const COLORS = {
  navyDark: '#0A2472', navyMid: '#1565C0', blue: '#1E88E5',
  cyan: '#29B6F6', cyanLight: '#90CAF9', bgLight: '#F0F4FF',
  cardBg: '#FFFFFF', cardBorder: '#BBDEFB', success: '#43A047', danger: '#E53935',
};
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;
type Tab = 'market' | 'portfolio' | 'history';

export default function InvestingScreen() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('market');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const assetsRef = useRef<Asset[]>([]);

  useEffect(() => { assetsRef.current = assets; }, [assets]);

  const fetchAllData = useCallback(async () => {
    try {
      setErrorMsg(null);
      const results = await Promise.allSettled([getPortfolio(), getAssets(), getHoldings(), getInvestments()]);
      let anySuccess = false;
      if (results[0].status === 'fulfilled') { setPortfolio(results[0].value.data); anySuccess = true; }
      if (results[1].status === 'fulfilled') { const d = results[1].value.data; setAssets(Array.isArray(d) ? d : []); anySuccess = true; }
      if (results[2].status === 'fulfilled') { const d = results[2].value.data; setHoldings(Array.isArray(d) ? d : []); anySuccess = true; }
      if (results[3].status === 'fulfilled') { const d = results[3].value.data; setInvestments(Array.isArray(d) ? d : []); anySuccess = true; }
      if (!anySuccess) {
        const firstError = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
        setErrorMsg(`Veri yuklenemedi: ${firstError?.reason?.message || 'Sunucuya baglanilamadi'}`);
      }
    } catch { setErrorMsg('Sunucuya baglanilamadi.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  useEffect(() => {
    const refreshPrices = async () => {
      try {
        const oldPrices: Record<number, number> = {};
        assetsRef.current.forEach((a) => { oldPrices[a.id] = Number(a.current_price); });
        const results = await Promise.allSettled([getAssets(), getHoldings()]);
        if (results[0].status === 'fulfilled') {
          const newAssets = results[0].value.data;
          if (Array.isArray(newAssets) && newAssets.length > 0) {
            setAssets(newAssets.map((a: Asset) => {
              const oldPrice = oldPrices[a.id]; const newPrice = Number(a.current_price);
              return { ...a, priceChange: oldPrice ? (newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : undefined) : undefined };
            }));
          }
        }
        if (results[1].status === 'fulfilled') { const d = results[1].value.data; if (Array.isArray(d)) setHoldings(d); }
      } catch { }
    };
    intervalRef.current = setInterval(refreshPrices, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const balance = portfolio ? Number(portfolio.balance) : 0;
  const totalHoldingsValue = holdings.reduce((s, h) => s + (h.current_value || 0), 0);
  const totalProfitLoss = holdings.reduce((s, h) => s + (h.profit_loss || 0), 0);
  const formatMoney = (val: number) => val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleReset = () => {
    Alert.alert('Portfoyu Sifirla', 'Tum yatirimlariniz silinecek. Emin misiniz?', [
      { text: 'Vazgec', style: 'cancel' },
      { text: 'Sifirla', style: 'destructive', onPress: async () => {
        try { await resetPortfolio(); fetchAllData(); }
        catch (error: any) { Alert.alert('Hata', `${error.response?.data?.error || error.message || ''}`); }
      }},
    ]);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount.replace(',', '.'));
    if (isNaN(amount) || amount <= 0) { Alert.alert('Hata', 'Gecerli bir miktar girin.'); return; }
    try { await depositBalance(amount); setDepositModalVisible(false); setDepositAmount(''); fetchAllData(); }
    catch { Alert.alert('Hata', 'Bakiye yuklenemedi.'); }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} translucent={false} />
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color={COLORS.cyan} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navyDark} translucent={false} />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/')}>
            <MaterialIcons name="arrow-back-ios" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yatirim Simulatoru</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Canli</Text>
          </View>
        </View>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Toplam Bakiye</Text>
          <Text style={styles.balanceValue}>{formatMoney(balance + totalHoldingsValue)} TL</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.depositButton} onPress={() => setDepositModalVisible(true)}>
            <MaterialIcons name="add" size={16} color="#fff" />
            <Text style={styles.btnText}>Bakiye Yukle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <MaterialIcons name="refresh" size={16} color="#fff" />
            <Text style={styles.btnText}>Sifirla</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={depositModalVisible} transparent animationType="fade" onRequestClose={() => setDepositModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Bakiye Yukle</Text>
            <Text style={styles.modalLabel}>Eklenecek Miktar (TL)</Text>
            <TextInput style={styles.modalInput} keyboardType="numeric" placeholder="Ornek: 50000" placeholderTextColor={COLORS.cyanLight} value={depositAmount} onChangeText={setDepositAmount} autoFocus />
            <View style={styles.modalPresets}>
              {[10000, 50000, 100000].map((preset) => (
                <TouchableOpacity key={preset} style={styles.presetBtn} onPress={() => setDepositAmount(String(preset))}>
                  <Text style={styles.presetText}>+{preset.toLocaleString('tr-TR')} TL</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setDepositModalVisible(false); setDepositAmount(''); }}>
                <Text style={styles.modalCancelText}>Iptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleDeposit}>
                <Text style={styles.modalConfirmText}>Yukle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAllData(); }} tintColor={COLORS.cyan} />}>
        {errorMsg && (
          <TouchableOpacity style={styles.errorBanner} onPress={fetchAllData}>
            <MaterialIcons name="error-outline" size={18} color="#fff" />
            <Text style={styles.errorText}>{errorMsg}</Text>
            <Text style={styles.errorRetry}>Tekrar Dene</Text>
          </TouchableOpacity>
        )}
        <InvestingSummaryCards balance={balance} totalHoldingsValue={totalHoldingsValue} totalProfitLoss={totalProfitLoss} />
        <View style={styles.tabRow}>
          {([
            { key: 'market' as Tab, label: 'Piyasa', icon: 'show-chart' as const },
            { key: 'portfolio' as Tab, label: 'Portfoy', icon: 'business-center' as const },
            { key: 'history' as Tab, label: 'Gecmis', icon: 'history' as const },
          ]).map((tab) => (
            <TouchableOpacity key={tab.key} style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]} onPress={() => setActiveTab(tab.key)}>
              <MaterialIcons name={tab.icon} size={18} color={activeTab === tab.key ? '#fff' : COLORS.navyMid} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {activeTab === 'market' && <MarketTab assets={assets} onTradeComplete={fetchAllData} />}
        {activeTab === 'portfolio' && <PortfolioTab holdings={holdings} />}
        {activeTab === 'history' && <HistoryTab investments={investments} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.navyDark },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.navyDark, paddingHorizontal: 20, paddingTop: STATUS_BAR_HEIGHT + 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 0 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#fff' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  liveText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  balanceRow: { marginTop: 12 },
  balanceLabel: { color: COLORS.cyanLight, fontSize: 13 },
  balanceValue: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 2 },
  headerButtons: { flexDirection: 'row', gap: 8, marginTop: 12 },
  depositButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(67,160,71,0.85)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  resetButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.navyDark, marginBottom: 16, textAlign: 'center' },
  modalLabel: { fontSize: 14, color: COLORS.navyMid, marginBottom: 8, fontWeight: '600' },
  modalInput: { borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 10, padding: 14, fontSize: 18, color: COLORS.navyDark, backgroundColor: COLORS.bgLight, marginBottom: 12 },
  modalPresets: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  presetBtn: { flex: 1, backgroundColor: '#E3F2FD', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  presetText: { color: COLORS.navyMid, fontWeight: '600', fontSize: 12 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center' },
  modalCancelText: { color: '#666', fontWeight: '600' },
  modalConfirm: { flex: 1, padding: 14, borderRadius: 10, backgroundColor: COLORS.navyMid, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontWeight: 'bold' },
  content: { flex: 1, backgroundColor: COLORS.bgLight, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  contentInner: { padding: 16, paddingBottom: 32 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.cardBorder },
  tabButtonActive: { backgroundColor: COLORS.navyMid, borderColor: COLORS.navyMid },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.navyMid },
  tabTextActive: { color: '#fff' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.danger, padding: 12, borderRadius: 10, marginBottom: 12 },
  errorText: { flex: 1, color: '#fff', fontSize: 12, fontWeight: '500' },
  errorRetry: { color: '#fff', fontSize: 12, fontWeight: 'bold', textDecorationLine: 'underline' },
});