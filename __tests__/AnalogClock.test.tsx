import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import type { SetStateAction } from 'react';

import { AnalogClock } from '../src/components/AnalogClock';
import type { TimeValue } from '../src/types/time';

describe('AnalogClock', () => {
  it('updates the selected hour and minute from drag gestures', () => {
    const state: { current: TimeValue } = {
      current: {
        hour12: 12,
        meridiem: 'AM',
        minute: 0,
      },
    };

    const handleChange = (value: SetStateAction<TimeValue>) => {
      state.current =
        typeof value === 'function' ? value(state.current) : value;

      screen.rerender(
        <AnalogClock
          interactive
          onChange={handleChange}
          showTimePreview
          size={300}
          time={state.current}
        />,
      );
    };

    const screen = render(
      <AnalogClock
        interactive
        onChange={handleChange}
        showTimePreview
        size={300}
        time={state.current}
      />,
    );

    const clockFace = screen.getByTestId('analog-clock-surface');

    fireEvent(clockFace, 'responderGrant', {
      nativeEvent: {
        locationX: 150,
        locationY: 48,
      },
    });
    fireEvent(clockFace, 'responderMove', {
      nativeEvent: {
        locationX: 62,
        locationY: 201,
      },
    });
    fireEvent(clockFace, 'responderRelease', {
      nativeEvent: {
        locationX: 62,
        locationY: 201,
      },
    });

    fireEvent(clockFace, 'responderGrant', {
      nativeEvent: {
        locationX: 150,
        locationY: 120,
      },
    });
    fireEvent(clockFace, 'responderMove', {
      nativeEvent: {
        locationX: 78,
        locationY: 150,
      },
    });
    fireEvent(clockFace, 'responderRelease', {
      nativeEvent: {
        locationX: 78,
        locationY: 150,
      },
    });

    expect(screen.getByText('9:40 AM')).toBeTruthy();
  });

  it('prefers the minute hand when the hands overlap', () => {
    const state: { current: TimeValue } = {
      current: {
        hour12: 12,
        meridiem: 'AM',
        minute: 0,
      },
    };

    const handleChange = (value: SetStateAction<TimeValue>) => {
      state.current =
        typeof value === 'function' ? value(state.current) : value;

      screen.rerender(
        <AnalogClock
          interactive
          onChange={handleChange}
          showTimePreview
          size={300}
          time={state.current}
        />,
      );
    };

    const screen = render(
      <AnalogClock
        interactive
        onChange={handleChange}
        showTimePreview
        size={300}
        time={state.current}
      />,
    );

    const clockFace = screen.getByTestId('analog-clock-surface');

    fireEvent(clockFace, 'responderGrant', {
      nativeEvent: {
        locationX: 150,
        locationY: 72,
      },
    });
    fireEvent(clockFace, 'responderMove', {
      nativeEvent: {
        locationX: 246,
        locationY: 150,
      },
    });
    fireEvent(clockFace, 'responderRelease', {
      nativeEvent: {
        locationX: 246,
        locationY: 150,
      },
    });

    expect(screen.getByText('12:15 AM')).toBeTruthy();
  });
});
