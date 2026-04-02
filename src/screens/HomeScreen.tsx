import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeaderSettingsButton } from '../components/HeaderSettingsButton';
import { fontFamily, palette, shadows } from '../styles/theme';
import type { HomeMode } from '../types/time';

type Props = {
  onOpenSettings: () => void;
  onSelectMode: (mode: HomeMode) => void;
};

const modeCards: Array<{
  accentColor: string;
  description: string;
  mode: HomeMode;
  title: string;
}> = [
  {
    accentColor: '#D95D67',
    description: 'Explore analog and digital time together.',
    mode: 'explore-time',
    title: 'Explore Time',
  },
  {
    accentColor: '#E49A33',
    description: 'Match the analog clock to a digital time.',
    mode: 'digital-to-analog',
    title: 'Set the Clock',
  },
  {
    accentColor: '#2D8F87',
    description: 'Read the analog clock and enter the time.',
    mode: 'analog-to-digital',
    title: 'Read the Clock',
  },
  {
    accentColor: '#556CD6',
    description: 'Figure out how much time has elapsed.',
    mode: 'elapsed-time',
    title: 'Elapsed Time',
  },
];

export function HomeScreen({ onOpenSettings, onSelectMode }: Props) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 768;
  const headerMaxWidth = Math.min(width - 24, 860);
  const contentWidth = Math.min(width - 24, isTablet ? 760 : 560);

  return (
    <ScrollView
      bounces={false}
      contentContainerStyle={[
        styles.scrollContent,
        {
          paddingBottom: Math.max(insets.bottom + 24, 28),
          paddingTop: Math.max(insets.top + 12, 28),
        },
      ]}
      style={styles.scrollView}
    >
      <View style={styles.backgroundBubbleLarge} />
      <View style={styles.backgroundBubbleSmall} />
      <View style={[styles.headerShell, { maxWidth: headerMaxWidth }]}>
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerSideSlot} />
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Time Tutor</Text>
            </View>
            <View style={styles.headerSideSlot}>
              <HeaderSettingsButton
                onPress={onOpenSettings}
                testID="open-settings-button"
              />
            </View>
          </View>
          <Text style={styles.modePrompt}>Choose a mode</Text>
        </View>
      </View>

      <View style={[styles.content, { maxWidth: contentWidth }]}>

        <View style={styles.cardColumn}>
          {modeCards.map(card => (
            <Pressable
              accessibilityRole="button"
              key={card.mode}
              onPress={() => onSelectMode(card.mode)}
              style={[styles.modeCard, { borderColor: card.accentColor }]}
              testID={`${card.mode}-card`}
            >
              <View
                style={[
                  styles.modeAccent,
                  {
                    backgroundColor: card.accentColor,
                  },
                ]}
              />
              <Text style={styles.modeTitle}>{card.title}</Text>
              <Text numberOfLines={1} style={styles.modeDescription}>
                {card.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: palette.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
  },
  backgroundBubbleLarge: {
    backgroundColor: palette.backgroundAccent,
    borderRadius: 999,
    height: 220,
    opacity: 0.5,
    position: 'absolute',
    right: -50,
    top: -20,
    width: 220,
  },
  backgroundBubbleSmall: {
    backgroundColor: '#DDEFE8',
    borderRadius: 999,
    height: 140,
    left: -30,
    opacity: 0.8,
    position: 'absolute',
    top: '32%',
    width: 140,
  },
  content: {
    alignSelf: 'center',
    gap: 18,
    width: '100%',
  },
  headerShell: {
    alignSelf: 'center',
    marginBottom: 18,
    width: '100%',
  },
  headerSection: {
    alignItems: 'stretch',
    gap: 8,
    paddingBottom: 6,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  headerSideSlot: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 68,
  },
  headerCopy: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.4,
    textAlign: 'center',
  },
  modePrompt: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  cardColumn: {
    gap: 14,
  },
  modeCard: {
    backgroundColor: palette.surface,
    borderRadius: 28,
    borderWidth: 2,
    overflow: 'hidden',
    paddingHorizontal: 22,
    paddingVertical: 22,
    ...shadows.card,
  },
  modeAccent: {
    borderRadius: 999,
    height: 12,
    marginBottom: 16,
    width: 64,
  },
  modeTitle: {
    color: palette.ink,
    fontFamily: fontFamily.display,
    fontSize: 28,
    fontWeight: '700',
  },
  modeDescription: {
    color: palette.inkMuted,
    fontFamily: fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
});
