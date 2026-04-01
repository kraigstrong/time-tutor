import { getFeatureAvailability } from '../src/utils/featureAvailability';

describe('feature availability', () => {
  it('enables challenge mode on native and web while prelaunch access is on', () => {
    expect(getFeatureAvailability('challenge-mode', 'ios')).toEqual({
      enabled: true,
      label: '1-Minute Challenge',
    });

    expect(getFeatureAvailability('challenge-mode', 'web')).toEqual({
      enabled: true,
      label: '1-Minute Challenge',
    });
  });
});
