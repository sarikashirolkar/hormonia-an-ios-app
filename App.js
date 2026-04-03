import React, { useState, useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import AuthScreen from './src/screens/Auth/AuthScreen';
import AnimatedBackground from './src/components/AnimatedBackground';
import { KEYS, getData, AuthSystem } from './src/storage/storage';
import { Colors } from './src/theme/tokens';

const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    checkAppBoot();
  }, []);

  const checkAppBoot = async () => {
    const user = await AuthSystem.restoreSession();
    if (user) {
      setIsAuthenticated(true);
      const completed = await getData(KEYS.ONBOARDING_COMPLETE);
      setHasOnboarded(!!completed);
    } else {
      setIsAuthenticated(false);
      setHasOnboarded(false);
    }
    setIsLoading(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    const completed = await getData(KEYS.ONBOARDING_COMPLETE);
    setHasOnboarded(!!completed);
    setIsAuthenticated(true);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await AuthSystem.logout();
    setIsAuthenticated(false);
    setHasOnboarded(false);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <AnimatedBackground>
        <View style={styles.loading}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <ActivityIndicator size="large" color={Colors.pink500} />
        </View>
      </AnimatedBackground>
    );
  }

  if (!isAuthenticated) {
    return (
      <AnimatedBackground>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <AuthScreen onLogin={handleLogin} />
        </SafeAreaProvider>
      </AnimatedBackground>
    );
  }

  if (!hasOnboarded) {
    return (
      <AnimatedBackground>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <OnboardingScreen onComplete={() => setHasOnboarded(true)} />
        </SafeAreaProvider>
      </AnimatedBackground>
    );
  }

  return (
    <AnimatedBackground>
      <SafeAreaProvider>
        <NavigationContainer theme={TransparentTheme}>
          <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
          <TabNavigator onLogout={handleLogout} />
        </NavigationContainer>
      </SafeAreaProvider>
    </AnimatedBackground>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
