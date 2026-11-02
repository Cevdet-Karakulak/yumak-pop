import {
  Baloo2_500Medium,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/baloo-2';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initAudio, pauseMusic, syncMusic } from './src/audio';
import { initAdMob } from './src/services/adService';
import { TOTAL_LEVELS } from './src/game/levels';
import { SaveProvider, useSave } from './src/save';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MapScreen } from './src/screens/MapScreen';
import { UI } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

type Route =
  | { name: 'home' }
  | { name: 'map' }
  | { name: 'game'; level: number; forceTutorial?: boolean };

function Root() {
  const { loaded, data } = useSave();
  const [fontsLoaded] = useFonts({ Baloo2_500Medium, Baloo2_700Bold, Baloo2_800ExtraBold });
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [gameKey, setGameKey] = useState(0);

  useEffect(() => {
    initAudio().catch((err) => console.warn('initAudio error:', err));
    initAdMob().catch((err) => console.warn('initAdMob error:', err));
    const sub = AppState.addEventListener('change', (s) => {
      try {
        s === 'active' ? syncMusic() : pauseMusic();
      } catch (e) {
        console.warn('AppState audio error:', e);
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (loaded && fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, fontsLoaded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded || !fontsLoaded) return <View style={{ flex: 1, backgroundColor: UI.cream }} />;

  const openLevel = (level: number, forceTutorial = false) => {
    setGameKey((k) => k + 1);
    setRoute({ name: 'game', level, forceTutorial });
  };

  return (
    <View style={{ flex: 1, backgroundColor: UI.cream }}>
      <StatusBar style="dark" />
      {route.name === 'home' && (
        <HomeScreen
          onPlay={() => openLevel(Math.min(data.unlocked, TOTAL_LEVELS))}
          onLevels={() => setRoute({ name: 'map' })}
          onPlayTutorial={() => openLevel(1, true)}
        />
      )}
      {route.name === 'map' && (
        <MapScreen onBack={() => setRoute({ name: 'home' })} onPlay={(n) => openLevel(n)} />
      )}
      {route.name === 'game' && (
        <GameScreen
          key={gameKey}
          level={route.level}
          forceTutorial={route.forceTutorial}
          onHome={() => setRoute({ name: 'home' })}
          onNext={(n) => openLevel(n)}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SaveProvider>
        <Root />
      </SaveProvider>
    </SafeAreaProvider>
  );
}
