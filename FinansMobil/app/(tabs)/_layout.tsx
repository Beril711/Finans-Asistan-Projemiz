import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Ana Sayfa' }} />
      <Tabs.Screen name="tracking" options={{ title: 'Harcamalar' }} />
      <Tabs.Screen name="investing" options={{ title: 'Yatirim' }} />
      <Tabs.Screen name="scanner" options={{ title: 'Tarayici' }} />
    </Tabs>
  );
}