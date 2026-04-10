/**
 * Root layout — Expo Router file-based navigation
 * app/_layout.tsx
 */
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAuthStore } from '../src/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 2,    // 2 min default stale time
      gcTime: 1000 * 60 * 10,       // 10 min cache
    },
  },
});

export default function RootLayout() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#0F0F0F' },
              animation: 'slide_from_right',
            }}
          />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/**
 * Tab layout — app/(tabs)/_layout.tsx
 */
// import { Tabs } from 'expo-router';
// import { COLORS } from '../src/theme';
//
// export default function TabsLayout() {
//   return (
//     <Tabs screenOptions={{
//       headerShown: false,
//       tabBarStyle: { backgroundColor: COLORS.surface, borderTopColor: COLORS.border },
//       tabBarActiveTintColor: COLORS.accent,
//       tabBarInactiveTintColor: COLORS.muted,
//     }}>
//       <Tabs.Screen name="index"      options={{ title: 'Home',     tabBarIcon: … }} />
//       <Tabs.Screen name="character"  options={{ title: 'Character',tabBarIcon: … }} />
//       <Tabs.Screen name="decide"     options={{ title: 'Decide',   tabBarIcon: … }} />
//       <Tabs.Screen name="quests"     options={{ title: 'Quests',   tabBarIcon: … }} />
//       <Tabs.Screen name="history"    options={{ title: 'History',  tabBarIcon: … }} />
//     </Tabs>
//   );
// }
