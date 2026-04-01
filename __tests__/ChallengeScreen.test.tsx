import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import * as ReactNative from 'react-native';
import {
  SafeAreaProvider,
  type Metrics,
} from 'react-native-safe-area-context';

import { ChallengeScreen } from '../src/screens/ChallengeScreen';
import * as timeUtils from '../src/utils/time';

jest.mock('../src/utils/time', () => {
  const actual = jest.requireActual('../src/utils/time');

  return {
    ...actual,
    nextTimeValueForInterval: jest.fn(),
    randomTimeValueForInterval: jest.fn(),
  };
});

const mockNextTimeValueForInterval = jest.mocked(timeUtils.nextTimeValueForInterval);
const mockRandomTimeValueForInterval = jest.mocked(
  timeUtils.randomTimeValueForInterval,
);
const safeAreaMetrics: Metrics = {
  frame: { height: 844, width: 390, x: 0, y: 0 },
  insets: { bottom: 34, left: 0, right: 0, top: 59 },
};

describe('ChallengeScreen', () => {
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
    mockNextTimeValueForInterval.mockReset();
    mockRandomTimeValueForInterval.mockReset();
  });

  it('increments the score and loads a new prompt after a correct answer', () => {
    mockRandomTimeValueForInterval.mockReturnValue({
      hour12: 3,
      meridiem: 'AM',
      minute: 25,
    });
    mockNextTimeValueForInterval.mockReturnValue({
      hour12: 4,
      meridiem: 'AM',
      minute: 30,
    });

    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ChallengeScreen mode="analog-to-digital" onBack={jest.fn()} />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('hour-increment-button'));
    fireEvent.press(screen.getByTestId('hour-increment-button'));
    fireEvent.press(screen.getByTestId('hour-increment-button'));

    for (let step = 0; step < 5; step += 1) {
      fireEvent.press(screen.getByTestId('minute-increment-button'));
    }

    fireEvent.press(screen.getByTestId('challenge-check-answer-button'));

    expect(screen.getByTestId('challenge-score').props.children).toBe(1);
    expect(mockNextTimeValueForInterval).toHaveBeenCalledWith(
      {
        hour12: 3,
        meridiem: 'AM',
        minute: 25,
      },
      '5-minute',
    );
  });

  it('ends the run after one minute and shows the summary card', () => {
    mockRandomTimeValueForInterval.mockReturnValue({
      hour12: 6,
      meridiem: 'AM',
      minute: 0,
    });
    mockNextTimeValueForInterval.mockReturnValue({
      hour12: 7,
      meridiem: 'AM',
      minute: 5,
    });

    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <ChallengeScreen mode="analog-to-digital" onBack={jest.fn()} />
      </SafeAreaProvider>,
    );

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(screen.getByTestId('challenge-summary')).toBeTruthy();
    expect(screen.getByText("Time's up!")).toBeTruthy();
    expect(screen.getByTestId('challenge-time-remaining').props.children).toBe(
      '0:00',
    );
  });
});
