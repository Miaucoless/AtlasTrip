import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, BORDER_RADIUS } from '../../utils/constants';

export default function GlassmorphicCard({ children, style, intensity = 20, tint = 'dark' }) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint={tint} style={[styles.card, style]}>
        <View style={styles.inner}>{children}</View>
      </BlurView>
    );
  }

  return (
    <View style={[styles.cardAndroid, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  inner: {
    backgroundColor: COLORS.glassBg,
  },
  cardAndroid: {
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
});
