import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

export type TabType = 'TODAY' | 'PROGRESS' | 'GOALS' | 'INSIGHTS' | 'ARC';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'TODAY', label: 'TODAY', icon: '⚡' },
  { id: 'PROGRESS', label: 'PROGRESS', icon: '📈' },
  { id: 'GOALS', label: 'GOALS', icon: '🎯' },
  { id: 'INSIGHTS', label: 'INSIGHTS', icon: '💡' },
  { id: 'ARC', label: 'ARC', icon: '❄️' }
];

export const Navigation: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, isActive && styles.activeTabBtn]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.iconText, isActive && styles.activeIconText]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  tabBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  activeTabBtn: {
    backgroundColor: COLORS.secondarySurface
  },
  iconText: {
    fontSize: 16,
    marginBottom: 2
  },
  activeIconText: {
    transform: [{ scale: 1.1 }]
  },
  tabLabel: {
    color: COLORS.mutedText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  activeTabLabel: {
    color: COLORS.iceAccent
  }
});
