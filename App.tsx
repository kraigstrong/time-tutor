import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { palette } from './src/styles/theme';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={palette.background}
        barStyle="dark-content"
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

export default App;
