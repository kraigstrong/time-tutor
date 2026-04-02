import { getFeatureAvailability } from '../src/utils/featureAvailability';

describe('feature availability', () => {
  it('enables gated features on native and web while prelaunch access is on', () => {
    expect(getFeatureAvailability('challenge-mode', 'ios')).toEqual({
      enabled: true,
      label: '1-Minute Challenge',
    });

    expect(getFeatureAvailability('challenge-mode', 'web')).toEqual({
      enabled: true,
      label: '1-Minute Challenge',
    });

    expect(getFeatureAvailability('time-format-24-hour', 'ios')).toEqual({
      enabled: true,
      label: '24-hour',
    });

    expect(getFeatureAvailability('time-format-24-hour', 'web')).toEqual({
      enabled: true,
      label: '24-hour',
    });

    expect(getFeatureAvailability('elapsed-time', 'ios')).toEqual({
      enabled: true,
      label: 'Elapsed Time',
    });

    expect(getFeatureAvailability('elapsed-time', 'web')).toEqual({
      enabled: true,
      label: 'Elapsed Time',
    });
  });
});
