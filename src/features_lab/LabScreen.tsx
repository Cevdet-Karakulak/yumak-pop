import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AsmrFeverTab } from './screens/AsmrFeverTab';
import { ForkLevelTab } from './screens/ForkLevelTab';
import { WorkshopTab } from './screens/WorkshopTab';

interface LabScreenProps {
  onBack: () => void;
}

export function LabScreen({ onBack }: LabScreenProps) {
  const [activeTab, setActiveTab] = useState<'workshop' | 'asmr' | 'fork'>('workshop');

  const handleTabChange = (tab: 'workshop' | 'asmr' | 'fork') => {
    setActiveTab(tab);
    Haptics.selectionAsync().catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#78350F" />
          <Text style={styles.backBtnText}>Canlı Oyuna Dön</Text>
        </TouchableOpacity>

        <View style={styles.corpBadge}>
          <Text style={styles.corpBadgeText}>FLOPPATECH LAB</Text>
        </View>
      </View>

      {/* Lab Banner */}
      <View style={styles.bannerBox}>
        <Text style={styles.bannerTitle}>🧪 Yenilikler Laboratuvarı (Sandbox v2)</Text>
        <Text style={styles.bannerSub}>
          Canlı sürüm etkilenmeden iOS ve Android'de birebir test ortamı
        </Text>
      </View>

      {/* Segmented Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'workshop' && styles.tabItemActive]}
          onPress={() => handleTabChange('workshop')}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'workshop' && styles.tabItemTextActive]}
          >
            🪵 Atölye
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'asmr' && styles.tabItemActive]}
          onPress={() => handleTabChange('asmr')}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'asmr' && styles.tabItemTextActive]}
          >
            🎵 ASMR Akor
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'fork' && styles.tabItemActive]}
          onPress={() => handleTabChange('fork')}
        >
          <Text
            style={[styles.tabItemText, activeTab === 'fork' && styles.tabItemTextActive]}
          >
            🔀 Çatal Parkur
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Body */}
      <View style={styles.tabBody}>
        {activeTab === 'workshop' && <WorkshopTab />}
        {activeTab === 'asmr' && <AsmrFeverTab />}
        {activeTab === 'fork' && <ForkLevelTab />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FDF8F0' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEBE4',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
  },
  backBtnText: { fontSize: 13, fontWeight: '800', color: '#78350F' },
  corpBadge: {
    backgroundColor: '#3E2723',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  corpBadgeText: { fontSize: 10, fontWeight: '900', color: '#FDF8F0', letterSpacing: 0.8 },
  bannerBox: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  bannerTitle: { fontSize: 16, fontWeight: '900', color: '#451A03' },
  bannerSub: { fontSize: 11, color: '#78350F', marginTop: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EFEBE4',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 6,
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabItemActive: { backgroundColor: '#78350F', elevation: 2 },
  tabItemText: { fontSize: 12, fontWeight: '800', color: '#78350F' },
  tabItemTextActive: { color: '#fff' },
  tabBody: { flex: 1 },
});
