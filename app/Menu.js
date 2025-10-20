import { createDrawerNavigator } from '@react-navigation/drawer';
import LeftDrawer from '../components/menus/LeftDrawer';
import MainMenu from '../components/menus/MainMenu';
import CalendarScreen from './Calendar';
import Contacts from './Contacts';
import ErrorMessageApp from './ErrorMessage';
import ErrorMessageKategorije from './ErrorMessageKategorije';
import LoginScreen from './login';
import QRCodeScreen from './QRCode';
import StemplApp from './Stempel';
import Today from './Today';
import Vacation from './Vacation';





const LeftDrawerFunction = (props) => {
  return <LeftDrawer {...props} name="David Hoja" />;
};



export default function MenuScreen({ route, navigation }) {
    const Drawer = createDrawerNavigator();

    return (
        <Drawer.Navigator  initialRouteName="MainMenu" drawerContent={LeftDrawerFunction}>
            <Drawer.Screen name="MainMenu" component={MainMenu} options={{title:"MT"}}/>
            <Drawer.Screen name="Kalendar" component={CalendarScreen}/>
            <Drawer.Screen name="GeneralPhoto" component={QRCodeScreen} options={{title:'QR Code scannen'}}/>
            <Drawer.Screen name="Stempl" component={StemplApp} options={{title:'Stempeln'}}/>
            <Drawer.Screen name="Kontakte" component={Contacts} options={{title:'Kontakte'}}/>
            <Drawer.Screen name="ErrorMessageKategorije" component={ErrorMessageKategorije} options={{title:'MT Apps'}}/>
            <Drawer.Screen name="InhouseApps" component={ErrorMessageApp} options={{title:'MT Apps'}}/>
            <Drawer.Screen name="Vacation" component={Vacation} options={{title:' Vacation'}}/>
            <Drawer.Screen name="Login" component={LoginScreen} options={{title:' Login'}}/>
            <Drawer.Screen name="Today" component={Today} options={{title:'Heute'}}/>
        </Drawer.Navigator>
    );
}
