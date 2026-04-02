import React from 'react';
import { Linking, Platform } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SettingsScreen } from '../src/screens/SettingsScreen';

describe('SettingsScreen', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  });

  afterEach(() => {
    (Platform as { OS: string }).OS = originalPlatform;
    jest.restoreAllMocks();
  });

  it('renders interval options and emits the selected interval', () => {
    const onBack = jest.fn();
    const onSelectInterval = jest.fn();
    const screen = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 852, width: 393, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 59 },
        }}
      >
        <SettingsScreen
          interval="5-minute"
          onBack={onBack}
          onSelectInterval={onSelectInterval}
          onSelectTimeFormat={jest.fn()}
          timeFormat="12-hour"
          timeFormat24Availability={{ enabled: true, label: '24-hour' }}
        />
      </SafeAreaProvider>,
    );

    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('1 minute')).toBeTruthy();
    expect(screen.getByText('5 minutes')).toBeTruthy();
    expect(screen.getByText('15 minutes')).toBeTruthy();
    expect(screen.getByText('Hours only')).toBeTruthy();
    expect(screen.getByText('12-hour')).toBeTruthy();
    expect(screen.getByText('24-hour')).toBeTruthy();
    expect(screen.getByText('Support')).toBeTruthy();
    expect(screen.getByText('Privacy Policy')).toBeTruthy();

    fireEvent.press(screen.getByTestId('interval-hours-only'));
    fireEvent.press(screen.getByTestId('settings-back-button'));

    expect(onSelectInterval).toHaveBeenCalledWith('hours-only');
    expect(onBack).toHaveBeenCalled();
  });

  it('renders time-format options and emits the selected format', () => {
    const onSelectTimeFormat = jest.fn();
    const screen = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 852, width: 393, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 59 },
        }}
      >
        <SettingsScreen
          interval="5-minute"
          onBack={jest.fn()}
          onSelectInterval={jest.fn()}
          onSelectTimeFormat={onSelectTimeFormat}
          timeFormat="12-hour"
          timeFormat24Availability={{ enabled: true, label: '24-hour' }}
        />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('time-format-24-hour'));

    expect(onSelectTimeFormat).toHaveBeenCalledWith('24-hour');
  });

  it('opens support and privacy links directly on web', () => {
    (Platform as { OS: string }).OS = 'web';

    const screen = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 852, width: 393, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 59 },
        }}
      >
        <SettingsScreen
          interval="5-minute"
          onBack={jest.fn()}
          onSelectInterval={jest.fn()}
          onSelectTimeFormat={jest.fn()}
          timeFormat="12-hour"
          timeFormat24Availability={{ enabled: true, label: '24-hour' }}
        />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('settings-support-link'));
    fireEvent.press(screen.getByTestId('settings-privacy-link'));

    expect(Linking.openURL).toHaveBeenNthCalledWith(
      1,
      'https://timetutor.app/support',
    );
    expect(Linking.openURL).toHaveBeenNthCalledWith(
      2,
      'https://timetutor.app/privacy',
    );
  });

  it('requires a parental gate before opening external links on ios', () => {
    (Platform as { OS: string }).OS = 'ios';
    jest.clearAllMocks();

    const screen = render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { height: 852, width: 393, x: 0, y: 0 },
          insets: { bottom: 34, left: 0, right: 0, top: 59 },
        }}
      >
        <SettingsScreen
          interval="5-minute"
          onBack={jest.fn()}
          onSelectInterval={jest.fn()}
          onSelectTimeFormat={jest.fn()}
          timeFormat="12-hour"
          timeFormat24Availability={{ enabled: true, label: '24-hour' }}
        />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('settings-support-link'));

    expect(screen.getByText('Parent Check')).toBeTruthy();
    expect(Linking.openURL).not.toHaveBeenCalled();

    fireEvent.changeText(screen.getByTestId('parental-gate-input'), '0');
    fireEvent.press(screen.getByTestId('parental-gate-continue'));

    expect(screen.getByTestId('parental-gate-error')).toBeTruthy();
    expect(Linking.openURL).not.toHaveBeenCalled();

    const question = screen.getByTestId('parental-gate-question').props.children;
    const left = Number(question[1]);
    const right = Number(question[3]);
    fireEvent.changeText(screen.getByTestId('parental-gate-input'), String(left + right));
    fireEvent.press(screen.getByTestId('parental-gate-continue'));

    expect(Linking.openURL).toHaveBeenCalledWith('https://timetutor.app/support');
  });
});
