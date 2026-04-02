import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';

import { PracticeScreen } from '../src/screens/PracticeScreen';
import * as timeUtils from '../src/utils/time';

jest.mock('../src/utils/time', () => {
  const actual = jest.requireActual('../src/utils/time');

  return {
    ...actual,
    randomTimeValueForInterval: jest.fn(),
  };
});

const mockRandomTimeValueForInterval = jest.mocked(
  timeUtils.randomTimeValueForInterval,
);
const safeAreaMetrics: Metrics = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 59 },
};

describe('PracticeScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest
      .spyOn(ReactNative, 'useWindowDimensions')
      .mockReturnValue({ fontScale: 1, height: 844, scale: 3, width: 390 });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    jest.restoreAllMocks();
    mockRandomTimeValueForInterval.mockReset();
  });

  it('celebrates a correct answer and automatically advances to a different prompt', () => {
    mockRandomTimeValueForInterval
      .mockReturnValueOnce({
        hour12: 3,
        meridiem: 'PM',
        minute: 25,
      })
      .mockReturnValue({
        hour12: 7,
        meridiem: 'AM',
        minute: 10,
      });

    const onBack = jest.fn();
    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <PracticeScreen mode="analog-to-digital" onBack={onBack} onOpenSettings={jest.fn()} />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('hour-increment-button'));
    fireEvent.press(screen.getByTestId('hour-increment-button'));
    fireEvent.press(screen.getByTestId('hour-increment-button'));

    for (let step = 0; step < 5; step += 1) {
      fireEvent.press(screen.getByTestId('minute-increment-button'));
    }

    fireEvent.press(screen.getByTestId('check-answer-button'));

    expect(screen.getByText('Nice work!')).toBeTruthy();
    expect(screen.getByTestId('practice-success-overlay')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1600);
    });

    expect(screen.queryByTestId('practice-success-overlay')).toBeNull();
  });

  it('disables minute changes when the practice interval is hours only', () => {
    mockRandomTimeValueForInterval.mockReturnValue({
      hour12: 6,
      meridiem: 'AM',
      minute: 0,
    });

    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <PracticeScreen mode="analog-to-digital" onBack={jest.fn()} onOpenSettings={jest.fn()} practiceInterval="hours-only" />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('hour-increment-button'));
    fireEvent.press(screen.getByTestId('minute-increment-button'));

    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('00')).toBeTruthy();
  });

  it('uses the selected interval for minute increments', () => {
    mockRandomTimeValueForInterval.mockReturnValue({
      hour12: 4,
      meridiem: 'AM',
      minute: 15,
    });

    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <PracticeScreen mode="analog-to-digital" onBack={jest.fn()} onOpenSettings={jest.fn()} practiceInterval="15-minute" />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('minute-increment-button'));

    expect(screen.getByText('15')).toBeTruthy();
  });

  it('shows a dismissible correct-time overlay on wrong answers without rendering the inline banner', () => {
    mockRandomTimeValueForInterval.mockReturnValue({
      hour12: 4,
      meridiem: 'AM',
      minute: 15,
    });

    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <PracticeScreen mode="analog-to-digital" onBack={jest.fn()} onOpenSettings={jest.fn()} />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('check-answer-button'));

    expect(screen.getByTestId('practice-wrong-answer-overlay')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
    expect(screen.getByText('You entered 12:00')).toBeTruthy();
    expect(screen.queryByText('Not quite yet.')).toBeNull();
    expect(screen.queryByText('You entered 12:00.')).toBeNull();

    fireEvent.press(screen.getByTestId('practice-dismiss-feedback-button'));

    expect(screen.queryByTestId('practice-wrong-answer-overlay')).toBeNull();
  });

  it('accepts either 24-hour equivalent when reading an analog clock', () => {
    mockRandomTimeValueForInterval.mockReturnValue({
      hour12: 11,
      meridiem: 'PM',
      minute: 0,
    });

    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <PracticeScreen
          mode="analog-to-digital"
          onBack={jest.fn()}
          onOpenSettings={jest.fn()}
          timeFormat="24-hour"
        />
      </SafeAreaProvider>,
    );

    for (let step = 0; step < 23; step += 1) {
      fireEvent.press(screen.getByTestId('hour-increment-button'));
    }

    fireEvent.press(screen.getByTestId('check-answer-button'));

    expect(screen.getByTestId('practice-success-overlay')).toBeTruthy();
  });

});
