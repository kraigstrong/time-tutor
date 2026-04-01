import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';

import { AppNavigator } from '../src/navigation/AppNavigator';

const safeAreaMetrics: Metrics = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 59 },
};

describe('AppNavigator', () => {
  it('routes from home into the mode chooser after selecting a learning mode', () => {
    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <AppNavigator />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('digital-to-analog-card'));

    expect(screen.getByText('Choose how you want to play.')).toBeTruthy();
    expect(screen.getByText('Practice')).toBeTruthy();
    expect(screen.getByText('1-Minute Challenge')).toBeTruthy();
  });
});
