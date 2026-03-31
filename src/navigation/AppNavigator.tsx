import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { PracticeScreen } from '../screens/PracticeScreen';
import type { ExerciseMode } from '../types/time';

type ActiveRoute =
  | {
      name: 'Home';
    }
  | {
      mode: ExerciseMode;
      name: 'Practice';
    };

export function AppNavigator() {
  const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
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

  if (route.name === 'Practice') {
    return (
      <PracticeScreen
        mode={route.mode}
        onBack={() => navigate({ name: 'Home' }, practiceBackMode)}
      />
    );
  }

  return (
    <HomeScreen
      onSelectMode={mode => navigate({ mode, name: 'Practice' })}
    />
  );
}

function getRouteFromBrowser(): ActiveRoute {
  const params = new URLSearchParams(window.location.search);
  const mode = params.get('mode');

  if (mode === 'digital-to-analog' || mode === 'analog-to-digital') {
    return {
      mode,
      name: 'Practice',
    };
  }

  return {
    name: 'Home',
  };
}

function getUrlForRoute(route: ActiveRoute): string {
  const url = new URL(window.location.href);

  url.search = '';

  if (route.name === 'Practice') {
    url.searchParams.set('mode', route.mode);
  }

  return `${url.pathname}${url.search}`;
}

function serializeRoute(route: ActiveRoute) {
  return route.name === 'Practice'
    ? {
        mode: route.mode,
        name: route.name,
      }
    : {
        name: route.name,
      };
}
