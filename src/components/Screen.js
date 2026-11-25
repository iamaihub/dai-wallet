import React from 'react';
import { View, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

/**
 * Air between the status bar, notch, or Dynamic Island and the first row.
 * The safe-area inset already clears the system chrome. This only keeps
 * titles off that line, and it is the same on every tab.
 */
export const CONTENT_TOP_GAP = 12;

/**
 * Height of the tab row, not counting the system inset drawn underneath.
 *
 * Apple HIG: a tab bar is 49pt. The home-indicator inset sits below it and
 * the bar background fills that inset.
 * Google: touch targets are at least 48dp. Material 3's stock navigation
 * bar is 80dp because it carries a 24dp icon and an active pill. This is a
 * compact custom tab bar, so Android uses 56dp, which clears 48dp without
 * restyling the footer. The gesture or 3-button inset is added below the
 * row, the same way UIKit adds the home indicator.
 */
export const TAB_BAR_CONTENT_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

function fallbackTop() {
  if (Platform.OS === 'android') return StatusBar.currentHeight || 24;
  if (Platform.OS === 'ios') return Constants.statusBarHeight || 20;
  return 0;
}

function fallbackBottom() {
  // Used only before native insets arrive. 48dp clears both Android gesture
  // navigation and the 3-button bar. A home-button iPhone has no bottom inset.
  if (Platform.OS === 'android') return 48;
  return 0;
}

export function useChromeInsets() {
  const insets = useSafeAreaInsets();
  const measured = insets.top > 0 || insets.bottom > 0 || insets.left > 0 || insets.right > 0;
  const top = measured ? insets.top : fallbackTop();
  const bottom = measured ? insets.bottom : fallbackBottom();
  return {
    top,
    bottom,
    left: measured ? insets.left : 0,
    right: measured ? insets.right : 0,
    tabBarHeight: TAB_BAR_CONTENT_HEIGHT + bottom,
  };
}

/**
 * Full-bleed screen. In-flow content sits below the status bar, notch,
 * Dynamic Island, and display cutout, and above the tab bar. The tab bar is
 * position absolute against this view's outer bottom edge, so its background
 * runs to the physical edge while this padding keeps content out from under it.
 */
export function Screen({ children, onLayout }) {
  const { top, left, right, tabBarHeight } = useChromeInsets();
  return (
    <View
      onLayout={onLayout}
      style={{
        flex: 1,
        backgroundColor: '#000',
        paddingTop: top + CONTENT_TOP_GAP,
        paddingBottom: tabBarHeight,
        paddingLeft: left,
        paddingRight: right,
      }}
    >
      {children}
    </View>
  );
}
