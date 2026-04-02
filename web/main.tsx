import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native';

import App from '../App';
import { PrivacyPage } from './PrivacyPage';
import { SupportPage } from './SupportPage';
import './styles.css';

const appName = 'TimeTutorWeb';
const rootTag = document.getElementById('root');

const pathname = window.location.pathname;

if (pathname === '/support' || pathname === '/support/') {
  createRoot(rootTag!).render(
    <React.StrictMode>
      <SupportPage />
    </React.StrictMode>,
  );
} else if (pathname === '/privacy' || pathname === '/privacy/') {
  createRoot(rootTag!).render(
    <React.StrictMode>
      <PrivacyPage />
    </React.StrictMode>,
  );
} else {
  AppRegistry.registerComponent(appName, () => App);
  AppRegistry.runApplication(appName, {
    rootTag,
  });
}
