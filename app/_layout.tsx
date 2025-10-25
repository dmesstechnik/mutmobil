import '../global.css';
import { Provider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { store } from './store';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="Menu" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </PaperProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}