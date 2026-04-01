import { Platform } from 'react-native';
import { useMemo } from 'react';

import type { FeatureAvailability, FeatureId } from '../types/features';

const WEB_PRELAUNCH_ENTITLEMENTS: Partial<Record<FeatureId, true>> = {
  'challenge-mode': true,
};

export function getFeatureAvailability(
  featureId: FeatureId,
  platform: string = Platform.OS,
): FeatureAvailability {
  switch (featureId) {
    case 'challenge-mode':
      return platform === 'web' && !WEB_PRELAUNCH_ENTITLEMENTS[featureId]
        ? {
            enabled: false,
            label: '1-Minute Challenge',
            reason: 'Available in the paid mobile app',
          }
        : {
            enabled: true,
            label: '1-Minute Challenge',
          };
    default:
      return {
        enabled: false,
        label: 'Unavailable feature',
      };
  }
}

export function useFeatureAvailability(featureId: FeatureId): FeatureAvailability {
  return useMemo(
    () => getFeatureAvailability(featureId, Platform.OS),
    [featureId],
  );
}
