import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Dimensions, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'react-native-elements';
import { BellIcon, CalendarIcon, CheckIcon, ClockIcon, DocumentTextIcon, EnvelopeIcon, ExclamationTriangleIcon, InformationCircleIcon, MapPinIcon, UserIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { useSelector } from 'react-redux';
import MesstechnikAPI from '../../API/MesstechnikAPI';
import { MIN_HOUR, SERVER } from '../../config/config';
import { checkInternetConnection } from '../../functions/InternetFunctions';
import GoogleMapsNavigation from '../../functions/NavigationFuntion';
import Notification from '../Notification';
import HeaderNotificationItem from './HeaderNotificationItem';

const MainMenu = ({ route }) => {
  const params = useLocalSearchParams();
  const [isVisible, setIsVisible] = useState(false)
  const [showMapNotification, setShowMapNotification] = useState(true);
  const [showStempelNotification, setShowStempelNotification] = useState(true);
  const [streetUseState, setStreet] = useState('');
  const [cityUseState, setCity] = useState('');
  const [user, setUser] = useState('');
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const navigation = useNavigation();
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [hasInternetConnection, setHasInternetConnection] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showAutoLoginMessage, setShowAutoLoginMessage] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const userId = useSelector((state) => state.auth.userId);
  const authToken = useSelector((state) => state.auth.token);

  useEffect(() => {
    getUserId();
    todaysOrders();

    const checkInternet = async () => {
      await checkInternetConnection().then((result) => {
        setHasInternetConnection(result);
      });
    };

    checkInternet();
    getNotifications();

    // Show auto-login message if coming from auto-login
    if (params?.autoLogin === 'true') {
      setShowAutoLoginMessage(true);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowAutoLoginMessage(false);
      });
    }

    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    if (currentHour < MIN_HOUR) {
      setShowMapNotification(true);
      setShowStempelNotification(true);
    } else {
      setShowMapNotification(false);
      setShowStempelNotification(false);
    }

    const interval = setInterval(() => {
      checkInternet();
    }, 5000);

    return () => clearInterval(interval);
  }, [route]);

  const getNotifications = async () => {
    let messtechnikApi = new MesstechnikAPI(authToken);
    const notifications = await messtechnikApi.getNotifications(userId);
    setNotifications(notifications);
  };

  const setNotificationSeen = async (notification) => {
    let messtechnikApi = new MesstechnikAPI(authToken);
    notification.read = true;
    await messtechnikApi.saveNotification(notification, () => {setNotifications(notifications.filter((n) => n.id !== notification.id))});
  }

  const getUserId = async () => {
    let apiMesstechnik = new MesstechnikAPI(authToken);
    const foundedUserById = await apiMesstechnik.getUserById(userId);
    setUser(foundedUserById);
  };

  const handleNavigation = (screen) => {
    navigation.navigate(screen);
  };

  const handleButtonPress = () => {
    setIsVisible(!isVisible);
  };

  const todaysOrders = async () => {
    let apiMesstechnik = new MesstechnikAPI(authToken);
    const todaysFirstOrder = await apiMesstechnik.getTodaysFirstOrder(userId);
    setCity(todaysFirstOrder.objSOs);
    setStreet(todaysFirstOrder.objSSt);
  };

  const openGoogleMaps = () => {
    const address = encodeURIComponent(`${streetUseState}, ${cityUseState}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url).catch((err) => console.error('Failed to open Google Maps', err));
  };

  const getTodaysOrders = async (installer, token) => {
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');

    const url = SERVER + `/order/calendarInfo/${installer}/date?fromDate=${formattedDate}&toDate=${formattedDate}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch today\'s orders:', error);
      return null;
    }
  };



  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-xl text-gray-800 font-light pt-1 mb-4">Willkommen zurück, {user.firstName}!</Text>

      {showAutoLoginMessage && (
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="bg-white p-4 rounded-lg  mb-4 flex-row items-center"
        >
          <CheckCircleIcon size={24} color="#10B981" />
          <Text className="text-gray-700 text-sm ml-3">
            Automatisch eingeloggt
          </Text>
        </Animated.View>
      )}

      <Image
        source={require('../../assets/images/company_front_logo.jpg')}
        style={{
          width: screenWidth - 40,
          height: screenHeight / 5,
          borderRadius: 12,
        }}
        resizeMode="cover"
      />
      <View>
        {!hasInternetConnection && <Notification iconColor={"red"} icon={<ExclamationTriangleIcon />} text={"Keine Internetverbindung vorhanden!"} textSize='text-md' />}
      </View>

      {showStempelNotification && (
  <View className="justify-center mt-4">
    <HeaderNotificationItem
      name={<Text className="mt-2 text-center text-gray-800 text-md">Guten Morgen <Text>{user.firstName}</Text>, vergiss nicht, dich einzustempeln, wenn du startklar bist!</Text>}
      button={<TouchableOpacity className="bg-blue-500 py-2 px-4 rounded-lg flex-row items-center" onPress={() => setShowStempelNotification(false)}>
                <CheckIcon size={20} color="white" />
                <Text className="text-white text-sm font-bold text-center ml-2">OK</Text>
              </TouchableOpacity>}
  
      onDeny={() => setShowMapNotification(false)}
    />
  </View>
)}

{showMapNotification && (
  <GoogleMapsNavigation/>
)}

      <TouchableOpacity
        className="flex-row items-center justify-between bg-white p-4 rounded-lg  mt-4"
        onPress={() => setNotificationsVisible(!notificationsVisible)}
      >
        <View className="flex-row items-center">
          <BellIcon size={24} color="#A9A9A9" />
          <Text className="text-lg font-semibold text-gray-800 ml-2">Benachrichtigungen</Text>
        </View>
        <Text className="text-lg font-semibold text-gray-800">{notifications.length}</Text>
      </TouchableOpacity>

      {notificationsVisible && (
        <View className="p-2 pt-0">
          {notifications.map((notification, index) => (
            <Notification
              key={index}
              icon={<InformationCircleIcon />}
              iconColor={"#0EA5E9"}
              text={notification.message}
              textColor={"#0EA5E9"}
              buttonText={"OK"}
              onPress={() => {setNotificationSeen(notification)}}
              
            />
          ))}
        </View>
      )}
<View className="flex flex-row flex-wrap justify-center">
  <TouchableOpacity
    className="bg-white rounded-xl m-2 justify-center items-center "
    style={{ width: (screenWidth / 3) - 30, height: (screenWidth / 3) - 24 }}
    onPress={() => handleNavigation('Stempl')}
  >
    <ClockIcon size={40} color="#4A4A4A" />
    <Text className="mt-2 text-sm text-gray-800 text-center" numberOfLines={1}>Stempeln</Text>
  </TouchableOpacity>

  <TouchableOpacity
    className="bg-white rounded-xl m-2 justify-center items-center "
    style={{ width: (screenWidth / 3) - 30, height: (screenWidth / 3) - 24 }}
    onPress={() => handleNavigation('Kalendar')}
  >
    <CalendarIcon size={40} color="#4A4A4A" />
    <Text className="mt-2 text-sm text-gray-800 text-center" numberOfLines={1}>Verplannung</Text>
  </TouchableOpacity>

<TouchableOpacity
  className="bg-white rounded-xl m-2 justify-center items-center"
  style={{ width: (screenWidth / 3) - 30, height: (screenWidth / 3) - 24 }}
  onPress={() => handleNavigation('Today')}
>
  <MapPinIcon size={40} color="#4A4A4A" />
  <Text className="mt-2 text-sm text-gray-800 text-center" numberOfLines={1}>Navi</Text>
</TouchableOpacity>

</View>

{/* Additional Menu Items */}
<View className="flex flex-row flex-wrap justify-center">
  <TouchableOpacity
    className="bg-white rounded-xl m-2 justify-center items-center"
    style={{ width: (screenWidth / 3) - 30, height: (screenWidth / 3) - 24 }}
    onPress={() => handleNavigation('Kontakte')}
  >
    <UserIcon size={40} color="#4A4A4A" />
    <Text className="mt-2 text-sm text-gray-800 text-center" numberOfLines={1}>Kontakte</Text>
  </TouchableOpacity>

  <TouchableOpacity
    className="bg-white rounded-xl m-2 justify-center items-center "
    style={{ width: (screenWidth / 3) - 30, height: (screenWidth / 3) - 24 }}
    onPress={() => handleNavigation('ErrorMessageKategorije')}
  >
    <EnvelopeIcon size={40} color="#4A4A4A" />
    <Text className="mt-2 text-sm text-gray-800 text-center" numberOfLines={1}>Verbesserungen</Text>
  </TouchableOpacity>

  <TouchableOpacity
    className="bg-white rounded-xl m-2 justify-center items-center "
    style={{ width: (screenWidth / 3) - 30, height: (screenWidth / 3) - 24 }}
    onPress={() => handleNavigation('Vacation')}
  >
    <CalendarIcon size={40} color="#4A4A4A" />
    <Text className="mt-2 text-sm text-center" numberOfLines={1}>Anträge</Text>
  </TouchableOpacity>

  <TouchableOpacity
    className="bg-white rounded-xl m-2 justify-center items-center "
    style={{ width: (screenWidth / 3) - 30, height: (screenWidth / 3) - 24 }}
    onPress={() => handleNavigation('StempelHistory')}
  >
    <DocumentTextIcon size={40} color="#4A4A4A" />
    <Text className="mt-2 text-sm text-gray-800 text-center" numberOfLines={1}>Stempelzeiten</Text>
  </TouchableOpacity>
</View>
    </ScrollView>
  );
};

export default MainMenu;