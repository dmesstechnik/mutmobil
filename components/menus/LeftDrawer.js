import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
    Bars3BottomLeftIcon,
    ClockIcon,
    DocumentTextIcon,
    MapPinIcon,
} from 'react-native-heroicons/outline';
import {
    CalendarIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    EnvelopeIcon,
    IdentificationIcon,
    NewspaperIcon,
    UserCircleIcon
} from 'react-native-heroicons/solid';
import { useDispatch, useSelector } from 'react-redux';
import MesstechnikAPI from '../../API/MesstechnikAPI';
import { clearAuthData } from '../../app/authSlice';
import LeftDrawerItem from './LeftDrawerItem';

const LeftDrawer = ({ navigation, name }) => {
  const [showFirma, setShowFirma] = useState(false);
  const [showWork, setShowWork] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [user, setUser] = useState({});
  const userId = useSelector((state) => state.auth.userId);
  const authToken = useSelector((state) => state.auth.token);
  const [profileImage, setProfileImage] = useState(null);

  const handleLogout = () => {
    dispatch(clearAuthData());
    router.replace({ pathname: '/login', params: { justLoggedOut: 'true' } });
  };

  const navigateToScreen = (screenName) => {
    if (navigation?.closeDrawer) navigation.closeDrawer();
    navigation.navigate(screenName);
  };

  useEffect(() => {
    fetchProfilePhoto();
  }, [authToken]);

  const fetchProfilePhoto = async () => {
    try {
      const apiMesstechnik = new MesstechnikAPI(authToken);
      apiMesstechnik.getProfilePhoto(
        userId,
        (imageSrc) => setProfileImage(imageSrc),
        (error) => console.error('Failed to fetch profile photo:', error)
      );
    } catch (error) {
      console.error('Error in fetchProfilePhoto:', error);
    }
  };

  const getUserId = async () => {
    if (!authToken || !userId) return;
    try {
      const apiMesstechnik = new MesstechnikAPI(authToken);
      const fetchedUser = await apiMesstechnik.getUserById(userId);
      setUser(fetchedUser || {});
    } catch (error) {
      console.error('LeftDrawer: Failed to fetch user:', error);
    }
  };

  useEffect(() => {
    getUserId();
  }, [authToken, userId]);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="flex-1 bg-gray-50">

        {/* Profile Section */}
        <TouchableOpacity
          className="w-full h-32 bg-white mt-0 rounded-b-xl overflow-hidden"
          onPress={() => navigateToScreen('Profile')}
        >
          <View className="flex-row items-center p-4 mt-6">
            {!profileImage ? (
              <UserCircleIcon size={70} color="#4A4A4A" />
            ) : (
              <Image
                source={{ uri: profileImage }}
                style={{ width: 70, height: 70, borderRadius: 35 }}
              />
            )}
            <View className="ml-4">
              <Text className="text-xl font-extrabold text-gray-800">
                {user?.firstName + ' ' + user?.lastName}
              </Text>
              <Text className="text-md font-bold text-gray-500">Monteur</Text>
            </View>
            <View className="flex-1" />
            <ChevronRightIcon size={30} color="#4A4A4A" />
          </View>
        </TouchableOpacity>

        {/* Main Menu */}
        <LeftDrawerItem
          title="Menu"
          screen="MainMenu"
          icon={<Bars3BottomLeftIcon size={30} color="black" />}
          navigation={navigation}
        />

        {/* ARBEIT Section */}
        <View className="mt-8 px-4">
          <TouchableOpacity
            className="flex-row items-center justify-between bg-white p-4 rounded-lg"
            onPress={() => setShowFirma(!showFirma)}
          >
            <Text className="text-lg font-bold text-gray-800">ARBEIT</Text>
            {showFirma ? (
              <ChevronDownIcon size={30} color="black" />
            ) : (
              <ChevronRightIcon size={30} color="black" />
            )}
          </TouchableOpacity>

          {showFirma && (
            <View className="space-y-4 mt-4">
              <LeftDrawerItem
                title="Verplannung"
                screen="Kalendar"
                icon={<NewspaperIcon size={30} color="black" />}
                navigation={navigation}
              />
              <LeftDrawerItem
                title="Navi"
                screen="Today"
                icon={<MapPinIcon size={40} color="#4A4A4A" />}
                navigation={navigation}
              />
            </View>
          )}
        </View>

        {/* FIRMA Section */}
        <View className="mt-8 px-4">
          <TouchableOpacity
            className="flex-row items-center justify-between bg-white p-4 rounded-lg"
            onPress={() => setShowWork(!showWork)}
          >
            <Text className="text-lg font-bold text-gray-800">FIRMA</Text>
            {showWork ? (
              <ChevronDownIcon size={30} color="black" />
            ) : (
              <ChevronRightIcon size={30} color="black" />
            )}
          </TouchableOpacity>

          {showWork && (
            <View className="space-y-4 mt-4">
              <LeftDrawerItem
                title="Stempeln"
                screen="Stempl"
                icon={<ClockIcon size={30} color="black" />}
                navigation={navigation}
              />
              <LeftDrawerItem
                title="Arbeitszeiten"
                screen="StempelHistory"
                icon={<DocumentTextIcon size={30} color="black" />}
                navigation={navigation}
              />
              <LeftDrawerItem
                title="Kontakte"
                screen="Kontakte"
                icon={<IdentificationIcon size={30} color="black" />}
                navigation={navigation}
              />
              <LeftDrawerItem
                title="Verbesserungen"
                screen="ErrorMessageKategorije"
                icon={<EnvelopeIcon size={30} color="black" />}
                navigation={navigation}
              />
              <LeftDrawerItem
                title="Anträge"
                screen="Vacation"
                icon={<CalendarIcon size={30} color="black" />}
                navigation={navigation}
              />
            </View>
          )}
        </View>

        {/* Logout Button */}
        <View className="flex items-center mt-8 mb-4">
          <View className="w-40">
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-blue-500 p-3 rounded-xl"
            >
              <Text className="text-white font-bold text-center">Abmelden</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </ScrollView>
  );
};

export default LeftDrawer;
