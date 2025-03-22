// This file is the entry point for the React Native application
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// Register the main component
AppRegistry.registerComponent(appName, () => App);