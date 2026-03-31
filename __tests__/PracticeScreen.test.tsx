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
    randomTimeValue: jest.fn(),
  };
});

const mockRandomTimeValue = jest.mocked(timeUtils.randomTimeValue);
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
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    mockRandomTimeValue.mockReset();
  });

  it('celebrates a correct answer and automatically advances to a different prompt', () => {
    mockRandomTimeValue
      .mockReturnValueOnce({
        hour12: 3,
        meridiem: 'PM',
        minute: 25,
      })
      .mockReturnValueOnce({
        hour12: 7,
        meridiem: 'AM',
        minute: 10,
      })
      .mockReturnValueOnce({
        hour12: 8,
        meridiem: 'PM',
        minute: 40,
      });

    const onBack = jest.fn();
    const screen = render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <PracticeScreen mode="analog-to-digital" onBack={onBack} />
      </SafeAreaProvider>,
    );

    fireEvent.press(screen.getByTestId('hour-increment-button'));
    fireEvent.press(screen.getByTestId('hour-increment-button'));
    fireEvent.press(screen.getByTestId('hour-increment-button'));

    for (let step = 0; step < 5; step += 1) {
      fireEvent.press(screen.getByTestId('minute-increment-button'));
    }

    fireEvent.press(screen.getByTestId('check-answer-button'));

    expect(screen.getByText('Correct! Nice work.')).toBeTruthy();
    expect(screen.getByText('You matched 3:25 exactly.')).toBeTruthy();
    expect(screen.getByText('Nice work!')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1600);
    });

    expect(screen.queryByText('Correct! Nice work.')).toBeNull();
    expect(screen.queryByText('You matched 3:25 exactly.')).toBeNull();
  });

});
