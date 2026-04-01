import { getFeatureAvailability } from '../src/utils/featureAvailability';

describe('feature availability', () => {
  it('enables challenge mode on native and disables it on web', () => {
    expect(getFeatureAvailability('challenge-mode', 'ios')).toEqual({
      enabled: true,
      label: '1-Minute Challenge',
    });

    expect(getFeatureAvailability('challenge-mode', 'web')).toEqual({
      enabled: false,
      label: '1-Minute Challenge',
      reason: 'Available in the paid mobile app',
    });
  });
});
