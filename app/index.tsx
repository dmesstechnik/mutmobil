import { Provider } from 'react-redux';
import { store } from './store'; // Adjust path to your store
import LoginScreen from './login';

export default function App() {
  return (
    <Provider store={store}>
      <LoginScreen />
    </Provider>
  );
}
