// Screenshot-only entry point. Do not use in production builds.
// The application UI is unchanged; this selects the seeded route and closes
// the keyboard as a user would after finishing the example form.
const AsyncStorage = require('@react-native-async-storage/async-storage').default;
const { Keyboard } = require('react-native');
const linking = require('expo-router/build/link/linking');
linking.getInitialURL = async () => {
  const route = await AsyncStorage.getItem('store-capture-route');
  return `minimal-habit-tracker://${route || '/'}`;
};
Keyboard.addListener('keyboardDidShow', () => setTimeout(() => Keyboard.dismiss(), 250));
require('expo-router/entry');
