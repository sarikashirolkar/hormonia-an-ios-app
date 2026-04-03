import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../../theme/tokens';
import { CuteCard } from '../../components/CuteComponents';
import { AuthSystem } from '../../storage/storage';

export default function AuthScreen({ onLogin }) {
  const [username, setUsername] = useState('');

  const handleLogin = async () => {
    if (username.trim().length < 2) return;
    await AuthSystem.login(username);
    onLogin();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.flowerRow}>
          <Text style={styles.flower}>🌸</Text>
          <Text style={[styles.flower, { fontSize: 32 }]}>🌺</Text>
          <Text style={styles.flower}>🌸</Text>
        </View>
        
        <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        
        <Text style={styles.welcomeSubtitle}>
          Your personal space for your unique body 🎀
        </Text>

        <CuteCard style={styles.loginCard}>
          <Text style={styles.label}>Who is blooming today?</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Enter your name to login or sign up..."
            placeholderTextColor={Colors.textMuted}
            value={username}
            onChangeText={setUsername}
            autoCorrect={false}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.primaryBtn, Shadows.glow, username.trim().length < 2 && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={username.trim().length < 2}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Enter My Garden 🌸</Text>
          </TouchableOpacity>
        </CuteCard>

        <Text style={styles.disclaimerGlass}>
          ⚕️ Your data is stored locally and stays completely private on this device.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  flowerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  flower: {
    fontSize: 24,
    opacity: 0.9,
  },
  logo: {
    width: 220,
    height: 110,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontWeight: '600',
  },
  loginCard: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: Colors.pink500,
    paddingVertical: 16,
    borderRadius: Radius.full,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  disclaimerGlass: {
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 18,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontWeight: '600',
    paddingHorizontal: 20,
  },
});
