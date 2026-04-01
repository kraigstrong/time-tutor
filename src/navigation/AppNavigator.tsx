import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { ChallengeScreen } from '../screens/ChallengeScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ModeChooserScreen } from '../screens/ModeChooserScreen';
import { PracticeScreen } from '../screens/PracticeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type { ExerciseMode, PracticeInterval, SessionType } from '../types/time';
import { getFeatureAvailability } from '../utils/featureAvailability';

type ActiveRoute =
  | {
      name: 'Home';
    }
  | {
      name: 'Settings';
    }
  | {
      mode: ExerciseMode;
      name: 'ModeChooser';
    }
  | {
      mode: ExerciseMode;
      name: 'Session';
      sessionType: SessionType;
    };

export function AppNavigator() {
  const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
  const [practiceInterval, setPracticeInterval] =
    useState<PracticeInterval>('5-minute');
  const challengeAvailability = getFeatureAvailability('challenge-mode');
  const [route, setRoute] = useState<ActiveRoute>(() =>
    isWeb ? getRouteFromBrowser() : { name: 'Home' },
  );

  const navigate = useCallback(
    (nextRoute: ActiveRoute, historyMode: 'push' | 'replace' = 'push') => {
      setRoute(nextRoute);

      if (!isWeb) {
        return;
      }

      const nextUrl = getUrlForRoute(nextRoute);
      const currentUrl = `${window.location.pathname}${window.location.search}`;

      if (nextUrl === currentUrl) {
        return;
      }

      window.history[historyMode === 'push' ? 'pushState' : 'replaceState'](
        serializeRoute(nextRoute),
        '',
        nextUrl,
      );
    },
    [isWeb],
  );

  useEffect(() => {
    if (!isWeb) {
      return;
    }

    window.history.replaceState(
      serializeRoute(route),
      '',
      getUrlForRoute(route),
    );

    const handlePopState = () => {
      setRoute(getRouteFromBrowser());
    };

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, [isWeb, route]);

  const practiceBackMode = useMemo<'push' | 'replace'>(
    () => (isWeb ? 'replace' : 'push'),
    [isWeb],
  );
  const chooserBackMode = useMemo<'push' | 'replace'>(
    () => (isWeb ? 'replace' : 'push'),
    [isWeb],
  );
  const settingsBackMode = useMemo<'push' | 'replace'>(
    () => (isWeb ? 'replace' : 'push'),
    [isWeb],
  );

  if (route.name === 'Session') {
    if (route.sessionType === 'challenge') {
      return (
        <ChallengeScreen
          mode={route.mode}
          onBack={() =>
            navigate({ mode: route.mode, name: 'ModeChooser' }, practiceBackMode)
          }
          practiceInterval={practiceInterval}
        />
      );
    }

    return (
      <PracticeScreen
        mode={route.mode}
        onBack={() =>
          navigate({ mode: route.mode, name: 'ModeChooser' }, practiceBackMode)
        }
        practiceInterval={practiceInterval}
      />
    );
  }

  if (route.name === 'ModeChooser') {
    return (
      <ModeChooserScreen
        challengeAvailability={challengeAvailability}
        mode={route.mode}
        onBack={() => navigate({ name: 'Home' }, chooserBackMode)}
        onSelectSession={sessionType => {
          if (sessionType === 'challenge' && !challengeAvailability.enabled) {
            return;
          }

          navigate({ mode: route.mode, name: 'Session', sessionType });
        }}
      />
    );
  }

  if (route.name === 'Settings') {
    return (
      <SettingsScreen
        interval={practiceInterval}
        onBack={() => navigate({ name: 'Home' }, settingsBackMode)}
        onSelectInterval={setPracticeInterval}
      />
    );
  }

  return (
    <HomeScreen
      onOpenSettings={() => navigate({ name: 'Settings' })}
      onSelectMode={mode => navigate({ mode, name: 'ModeChooser' })}
    />
  );
}

function getRouteFromBrowser(): ActiveRoute {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('page');
  const mode = params.get('mode');
  const session = params.get('session');
  const challengeAvailability = getFeatureAvailability('challenge-mode', 'web');

  if (page === 'settings') {
    return {
      name: 'Settings',
    };
  }

  if (mode === 'digital-to-analog' || mode === 'analog-to-digital') {
    if (session === 'challenge' && challengeAvailability.enabled) {
      return {
        mode,
        name: 'Session',
        sessionType: 'challenge',
      };
    }

    if (session === 'practice') {
      return {
        mode,
        name: 'Session',
        sessionType: 'practice',
      };
    }

    return {
      mode,
      name: 'ModeChooser',
    };
  }

  return {
    name: 'Home',
  };
}

function getUrlForRoute(route: ActiveRoute): string {
  const url = new URL(window.location.href);

  url.search = '';

  if (route.name === 'ModeChooser') {
    url.searchParams.set('mode', route.mode);
  }

  if (route.name === 'Session') {
    url.searchParams.set('mode', route.mode);
    url.searchParams.set('session', route.sessionType);
  }

  if (route.name === 'Settings') {
    url.searchParams.set('page', 'settings');
  }

  return `${url.pathname}${url.search}`;
}

function serializeRoute(route: ActiveRoute) {
  return route.name === 'Session'
    ? {
        mode: route.mode,
        name: route.name,
        sessionType: route.sessionType,
      }
    : route.name === 'ModeChooser'
      ? {
          mode: route.mode,
          name: route.name,
        }
    : route.name === 'Settings'
      ? {
          name: route.name,
        }
      : {
        name: route.name,
      };
}
