import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import LeftDrawer from '../components/menus/LeftDrawer';
import MainMenu from '../components/menus/MainMenu';
import CalendarScreen from './Calendar';
import Contacts from './Contacts';
import ErrorMessageApp from './ErrorMessage';
import ErrorMessageKategorije from './ErrorMessageKategorije';
import LoginScreen from './login';
import ProfileScreen from './Profil'; // or './Profile' if that's the filename
import QRCodeScreen from './QRCode';
import StemplApp from './Stempel';

import { store } from './store';
import Today from './Today';
import Vacation from './Vacation';

const LeftDrawerFunction = (props) => {
  return <LeftDrawer {...props} name="David Hoja" />;
};

const Drawer = createDrawerNavigator();
function MenuNavigator({ route, navigation }) {
  return (
    <Drawer.Navigator initialRouteName="MainMenu" drawerContent={LeftDrawerFunction}>
      <Drawer.Screen name="MainMenu" component={MainMenu} options={{title:"MT"}}/>
      <Drawer.Screen name="Kalendar" component={CalendarScreen}/>
      <Drawer.Screen name="GeneralPhoto" component={QRCodeScreen} options={{title:'QR Code scannen'}}/>
      <Drawer.Screen name="Stempl" component={StemplApp} options={{title:'Stempeln'}}/>
      <Drawer.Screen name="Kontakte" component={Contacts} options={{title:'Kontakte'}}/>
      <Drawer.Screen name="ErrorMessageKategorije" component={ErrorMessageKategorije} options={{title:'MT Apps'}}/>
      <Drawer.Screen name="InhouseApps" component={ErrorMessageApp} options={{title:'MT Apps'}}/>
      <Drawer.Screen name="Vacation" component={Vacation} options={{title:'Vacation'}}/>
      <Drawer.Screen name="Login" component={LoginScreen} options={{title:'Login'}}/>
      <Drawer.Screen name="Today" component={Today} options={{title:'Heute'}}/>
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{title:'Profil'}}/>
      <Drawer.Screen name="StempelHistory" component={StempelHis} options={{title:'Stempelzeiten'}}/>
    </Drawer.Navigator>
  );
}

export default function MenuScreen(props) {
  return (
    <Provider store={store}>
      <PaperProvider>
        <MenuNavigator {...props} />
      </PaperProvider>
    </Provider>
  );
}