import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Shadows, Spacing } from '../theme/tokens';

export function CuteCard({ children, style, accent, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  const BlurWrapper = accent ? View : BlurView; // Don't blur solid accent cards

  return (
    <Wrapper onPress={onPress} activeOpacity={0.85} style={style}>
      <BlurWrapper
        intensity={accent ? undefined : 60}
        tint={accent ? undefined : "light"}
        style={[
          styles.card,
          accent && styles.cardAccent,
          !accent && styles.cardGlass,
          Shadows.sm,
        ]}
      >
        {children}
      </BlurWrapper>
    </Wrapper>
  );
}

export function PillButton({ label, active, onPress, color, emoji, small }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.pill,
        active && { backgroundColor: color || Colors.pink500 },
        small && { paddingVertical: 5, paddingHorizontal: 10 },
      ]}
    >
      {emoji && <Text style={styles.pillEmoji}>{emoji}</Text>}
      <Text style={[
        styles.pillText,
        active && { color: Colors.white },
        small && { fontSize: 12 },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function SectionHeader({ title, emoji, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {emoji && <Text style={{ fontSize: 18 }}>{emoji}</Text>}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function BowDecoration({ size = 24, color = Colors.pink300, style }) {
  return (
    <Text style={[{ fontSize: size, opacity: 0.7 }, style]}>🎀</Text>
  );
}

export function FlowerDecoration({ size = 20, style }) {
  return (
    <Text style={[{ fontSize: size, opacity: 0.6 }, style]}>🌸</Text>
  );
}

export function CuteCheckbox({ checked, onPress, label, sublabel }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.checkboxRow}
      activeOpacity={0.7}
    >
      <View style={[
        styles.checkbox,
        checked && styles.checkboxChecked,
      ]}>
        {checked && <Text style={{ color: Colors.white, fontSize: 12 }}>✓</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[
          styles.checkboxLabel,
          checked && styles.checkboxLabelChecked,
        ]}>
          {label}
        </Text>
        {sublabel && (
          <Text style={styles.checkboxSublabel}>{sublabel}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function MiniBarChart({ data, maxValue, barColor, height = 100 }) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <View style={[styles.barChart, { height }]}>
      {data.map((d, i) => (
        <View key={i} style={styles.barWrapper}>
          <View style={[styles.barContainer, { height: height - 20 }]}>
            <View
              style={[
                styles.bar,
                {
                  height: `${Math.max((d.value / max) * 100, 5)}%`,
                  backgroundColor: d.isToday
                    ? (barColor || Colors.pink500)
                    : d.value > 0 ? (barColor || Colors.pink300) : Colors.pink100,
                  opacity: d.isToday ? 1 : d.value > 0 ? 0.5 : 0.3,
                },
              ]}
            />
          </View>
          <Text style={[
            styles.barLabel,
            d.isToday && { fontWeight: '700', color: Colors.textPrimary },
          ]}>
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ProgressRing({ value, max, size = 140, strokeWidth = 10, color, label, unit }) {
  const progress = Math.min(value / max, 1);
  const circumference = Math.PI * (size - strokeWidth);
  const progressWidth = circumference * progress;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background circle using border */}
      <View style={{
        width: size, height: size, borderRadius: size / 2,
        borderWidth: strokeWidth, borderColor: Colors.pink100,
        position: 'absolute',
      }} />
      {/* We'll use a simple percentage display since SVG needs react-native-svg */}
      <View style={{
        width: size - strokeWidth * 2,
        height: size - strokeWidth * 2,
        borderRadius: (size - strokeWidth * 2) / 2,
        borderWidth: strokeWidth,
        borderColor: 'transparent',
        borderTopColor: color || Colors.pink500,
        borderRightColor: progress > 0.25 ? (color || Colors.pink500) : 'transparent',
        borderBottomColor: progress > 0.5 ? (color || Colors.pink500) : 'transparent',
        borderLeftColor: progress > 0.75 ? (color || Colors.pink500) : 'transparent',
        position: 'absolute',
        transform: [{ rotate: '-45deg' }],
      }} />
      <View style={{ alignItems: 'center' }}>
        <Text style={{
          fontSize: size * 0.2,
          fontWeight: '700',
          color: color || Colors.pink500,
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </Text>
        {unit && <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{unit}</Text>}
        {label && <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{label}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  cardGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Semi-transparent overlay
    borderColor: 'rgba(255, 255, 255, 0.65)',     // Glass edge reflection
    borderWidth: 1.5,
    overflow: 'hidden', // to keep blur inside border
  },
  cardAccent: {
    backgroundColor: Colors.pink500,
    borderColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: Colors.pink50,
  },
  pillEmoji: {
    fontSize: 14,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.pink700,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.pink600,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.pink300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.mint400,
    borderColor: Colors.mint400,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  checkboxLabelChecked: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  checkboxSublabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    paddingHorizontal: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barContainer: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    maxWidth: 30,
    borderRadius: 6,
    minHeight: 3,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
