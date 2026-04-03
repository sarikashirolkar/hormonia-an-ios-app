import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

export default function AnimatedBackground({ children }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/bg.jpeg')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      {/* Main Content goes on top */}
      <View style={styles.contentOverlay}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // fall back if image doesn't load
  },
  contentOverlay: {
    flex: 1,
  },
});
