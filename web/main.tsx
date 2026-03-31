import { AppRegistry } from 'react-native';
import { inject } from '@vercel/analytics';

import App from '../App';
import './styles.css';

const appName = 'TimeTutorWeb';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});

inject({
  mode: import.meta.env.DEV ? 'development' : 'production',
});
