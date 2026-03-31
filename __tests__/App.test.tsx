import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { HomeScreen } from '../src/screens/HomeScreen';

describe('HomeScreen', () => {
  it('shows both learning modes and emits the selected mode', () => {
    const onSelectMode = jest.fn();
    const { getByText, getByTestId } = render(
      <HomeScreen onSelectMode={onSelectMode} />,
    );

    expect(getByText('Time Tutor')).toBeTruthy();
    expect(getByText('Choose a mode')).toBeTruthy();
    expect(getByText('Set the Clock')).toBeTruthy();
    expect(getByText('Read the Clock')).toBeTruthy();

    fireEvent.press(getByTestId('digital-to-analog-card'));

    expect(onSelectMode).toHaveBeenCalledWith('digital-to-analog');
  });
});
