import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Bars3BottomLeftIcon, ClockIcon } from 'react-native-heroicons/outline';
import { BriefcaseIcon, CalendarIcon, ChevronDownIcon, ChevronRightIcon, EnvelopeIcon, IdentificationIcon, NewspaperIcon, QrCodeIcon, UserCircleIcon } from 'react-native-heroicons/solid';
import { useDispatch, useSelector } from 'react-redux';
import MesstechnikAPI from '../../API/MesstechnikAPI';
import { clearAuthData } from '../../app/authSlice';
import LeftDrawerItem from './LeftDrawerItem';

const LeftDrawer = ({ name }) => {
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

    useEffect(() => {
        fetchProfilePhoto();
    }, [authToken]);

    const fetchProfilePhoto = async () => {
        console.log("Fetching");
        const apiMesstechnik = new MesstechnikAPI(authToken);
        apiMesstechnik.getProfilePhoto(
            userId,
            (imageSrc) => {
                setProfileImage(imageSrc);
                console.log("dotest");
            },
            (error) => {
                console.error('Failed to fetch profile photo:', error);
            }
        );
    };

    const getUserId = async () => {
        console.log('LeftDrawer: getUserId called with:', { authToken: authToken?.substring(0, 20) + '...', userId });

        if (!authToken || !userId) {
            console.log('LeftDrawer: Missing authToken or userId', { authToken: !!authToken, userId });
            return;
        }

        try {
            let apiMesstechnik = new MesstechnikAPI(authToken);
            const foundedUserById = await apiMesstechnik.getUserById(userId);
            console.log('LeftDrawer: User data fetched:', JSON.stringify(foundedUserById));

            if (!foundedUserById || !foundedUserById.firstName) {
                console.error('LeftDrawer: User data is missing firstName/lastName!', foundedUserById);
            }

            setUser(foundedUserById || {});
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
                <TouchableOpacity className="w-full h-32 bg-white mt-0 rounded-b-xl overflow-hidden shadow-lg" onPress={() => router.push("/Profil")}>

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
                            <Text className="text-xl font-extrabold text-gray-800">{user?.firstName + " " + user?.lastName}</Text>
                            <Text className="text-md font-bold text-gray-500">Monteur</Text>
                        </View>
                        <View className="flex-1"></View>
                        <ChevronRightIcon size={30} color="#4A4A4A" />
                    </View>
                </TouchableOpacity>

                <LeftDrawerItem title="Menü" screen={"MainMenu"} initialParams={{ userid: "", token: "" }} icon={<Bars3BottomLeftIcon size={30} color="black" />} />

                <View className="mt-8 px-4">
                    <TouchableOpacity
                        className="flex-row items-center justify-between bg-white p-4 rounded-lg shadow-md"
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
                            <LeftDrawerItem title="Verplannung" screen={"Kalendar"} icon={<NewspaperIcon size={30} color="black" />} />
                            <LeftDrawerItem title="Heute" screen={"Today"} icon={<BriefcaseIcon size={30} color="black" />} />
                            <LeftDrawerItem title="Meßtechnik Foto" screen={"GeneralPhoto"} icon={<QrCodeIcon size={30} color="black" />} />
                        </View>
                    )}
                </View>

                <View className="mt-8 px-4">
                    <TouchableOpacity
                        className="flex-row items-center justify-between bg-white p-4 rounded-lg shadow-md"
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
                            <LeftDrawerItem title="Stempl" screen={"Stempl"} icon={<ClockIcon size={30} color="black" />} />
                            <LeftDrawerItem title="Kontakte" screen={"Kontakte"} icon={<IdentificationIcon size={30} color="black" />} />
                            <LeftDrawerItem title="Verbesserungen" screen={"ErrorMessageKategorije"} icon={<EnvelopeIcon size={30} color="black" />} />
                            <LeftDrawerItem title="Antrage" screen={"Vacation"} icon={<CalendarIcon size={30} color="black" />} />
                        </View>
                    )}
                </View>

                <View className="w-40 mt-5 ml-12  left-7">
                    <TouchableOpacity
                        onPress={() => { handleLogout() }}
                        className="bg-red-300 p-3 rounded-xl "
                    >
                        <Text className="text-white font-bold ml-10">Log Out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default LeftDrawer;