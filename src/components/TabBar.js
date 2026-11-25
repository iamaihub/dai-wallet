import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useChromeInsets, TAB_BAR_CONTENT_HEIGHT } from './Screen';

const TABS = [
  { key: 'home',    icon: '●', iconOff: '○', labelKey: 'tab.home' },
  { key: 'history', icon: '⇄', iconOff: '⇄', labelKey: 'tab.history' },
  { key: 'p2p',     icon: '⇋', iconOff: '⇋', label: 'P2P' },
  { key: 'chat',    icon: '✦', iconOff: '✦', label: 'Ask AI' },
];

export default function TabBar({ currentScreen, onTabPress, t }) {
  const { bottom, left, right } = useChromeInsets();
  return (
    <View
      style={[
        styles.tabBar,
        { paddingBottom: bottom, paddingLeft: left, paddingRight: right },
      ]}
    >
      {TABS.map(tab => {
        const isActive = currentScreen === tab.key;
        const label = tab.label || (t ? t(tab.labelKey) : tab.key);
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabPress(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={label}
          >
            <Text style={[styles.tabIcon, isActive && styles.tabIconActive]}>
              {isActive ? tab.icon : tab.iconOff}
            </Text>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Background reaches the physical bottom. paddingBottom is the home
  // indicator (iOS) or the system navigation bar (Android), so the icons
  // and labels stay in the tappable row above that inset.
  tabBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#222',
    backgroundColor: '#000',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TAB_BAR_CONTENT_HEIGHT,
    paddingHorizontal: 4,
  },
  tabActive: { borderTopWidth: 3, borderTopColor: '#22c55e' },
  tabIcon: { color: '#888', fontSize: 16, fontFamily: 'Iceland_400Regular', lineHeight: 22 },
  tabIconActive: { color: '#22c55e' },
  tabText: { color: '#888', fontSize: 11, fontFamily: 'Iceland_400Regular', lineHeight: 16, marginTop: 2 },
  tabTextActive: { color: '#22c55e', fontWeight: '600', fontFamily: 'Iceland_400Regular', lineHeight: 16 },
});
