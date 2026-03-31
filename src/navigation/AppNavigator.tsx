import React, { useState } from 'react';

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
  const [route, setRoute] = useState<ActiveRoute>({
    name: 'Home',
  });

  if (route.name === 'Practice') {
    return (
      <PracticeScreen
        mode={route.mode}
        onBack={() =>
          setRoute({
            name: 'Home',
          })
        }
      />
    );
  }

  return (
    <HomeScreen
      onSelectMode={mode =>
        setRoute({
          mode,
          name: 'Practice',
        })
      }
    />
  );
}
