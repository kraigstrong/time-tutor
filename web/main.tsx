import { AppRegistry } from 'react-native';

import App from '../App';
import './styles.css';

const appName = 'TimeTutorWeb';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
