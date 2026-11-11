import {
  Baloo2_500Medium,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/baloo-2';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initAudio, pauseMusic, syncMusic } from './src/audio';
import { AnimatedSplashScreen } from './src/components/AnimatedSplashScreen';
import { TOTAL_LEVELS } from './src/game/levels';
import { SaveProvider, useSave } from './src/save';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { MapScreen } from './src/screens/MapScreen';
import { initAdMob, setTrackingAuthorized } from './src/services/adService';
import { endIAP, initIAP } from './src/services/iapService';
import { WorkshopScreen } from './src/screens/WorkshopScreen';
import { RatingModal } from './src/components/RatingModal';
import { shouldPromptReview } from './src/services/reviewService';
import { UI } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function waitForAppActive(): Promise<void> {
  if (AppState.currentState === 'active') return Promise.resolve();
  return new Promise((resolve) => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sub.remove();
        resolve();
      }
    });
  });
}

type Route =
  | { name: 'home' }
  | { name: 'map' }
  | { name: 'game'; level: number; forceTutorial?: boolean }
  | { name: 'workshop' };

function Root() {
  const { loaded, data, update } = useSave();
  const [fontsLoaded] = useFonts({ Baloo2_500Medium, Baloo2_700Bold, Baloo2_800ExtraBold });
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [gameKey, setGameKey] = useState(0);
  const [splashFinished, setSplashFinished] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isManualRating, setIsManualRating] = useState(false);
  const attStartedRef = useRef(false);

  // Active in-game play time accumulator (records active seconds every 15s)
  useEffect(() => {
    if (!loaded) return;
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        update((d) => ({
          ...d,
          totalPlayTimeSeconds: (d.totalPlayTimeSeconds || 0) + 15,
        }));
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [loaded, update]);

  // Check if review prompt should trigger when in home screen
  useEffect(() => {
    if (loaded && splashFinished && route.name === 'home') {
      if (shouldPromptReview(data)) {
        const timer = setTimeout(() => {
          setIsManualRating(false);
          setShowRatingModal(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [loaded, splashFinished, route.name, data]);

  useEffect(() => {
    // Hide static native splash immediately so our interactive animated splash screen takes over
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    initAudio().catch((err) => console.warn('initAudio error:', err));
    if (Platform.OS !== 'ios') {
      initAdMob().catch((err) => console.warn('initAdMob error:', err));
    }
    initIAP().catch((err) => console.warn('initIAP error:', err));
    const sub = AppState.addEventListener('change', (s) => {
      try {
        s === 'active' ? syncMusic() : pauseMusic();
      } catch (e) {
        console.warn('AppState audio error:', e);
      }
    });
    return () => {
      sub.remove();
      endIAP().catch(() => {});
    };
  }, []);

  // Request iOS/iPadOS App Tracking Transparency (ATT) strictly when active and BEFORE AdMob initialization
  useEffect(() => {
    if (!splashFinished || Platform.OS !== 'ios' || attStartedRef.current) return;
    attStartedRef.current = true;

    const requestATTAndInitAds = async () => {
      let granted = false;
      try {
        await waitForAppActive();
        await new Promise((resolve) => setTimeout(resolve, 400));
        await waitForAppActive();
        const res = await requestTrackingPermissionsAsync();
        granted = res.status === 'granted';
        console.log('[ATT] Tracking authorization status:', res.status);
      } catch (err) {
        console.warn('[ATT] requestTrackingPermissionsAsync warning:', err);
      } finally {
        setTrackingAuthorized(granted);
        initAdMob().catch((err) => console.warn('initAdMob error:', err));
      }
    };

    requestATTAndInitAds();
  }, [splashFinished]);

  const isReady = loaded && Boolean(fontsLoaded);

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
          onWorkshop={() => setRoute({ name: 'workshop' })}
          onRateApp={() => {
            setIsManualRating(true);
            setShowRatingModal(true);
          }}
        />
      )}
      {route.name === 'workshop' && (
        <WorkshopScreen onBack={() => setRoute({ name: 'home' })} />
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

      {/* In-App Bobbin Star Rating & Review Modal */}
      <RatingModal
        visible={showRatingModal}
        isManual={isManualRating}
        onClose={() => setShowRatingModal(false)}
      />

      {/* Interactive Animated Splash Overlay */}
      {!splashFinished && (
        <AnimatedSplashScreen
          isReady={isReady}
          onFinish={() => setSplashFinished(true)}
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
