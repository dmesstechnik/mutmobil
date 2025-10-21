import { Provider } from 'react-redux';
import { store } from './store'; // Adjust path to your store
import LoginScreen from './login';
import '../global.css';
import { NativeWindStyleSheet } from 'nativewind';


export default function App() {
  return (
    <Provider store={store}>
      <LoginScreen />
    </Provider>
  );
}
