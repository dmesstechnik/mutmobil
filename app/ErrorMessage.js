import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ChartBarIcon, InformationCircleIcon } from 'react-native-heroicons/outline';
import { useSelector } from 'react-redux';
import MesstechnikAPI from '../API/MesstechnikAPI';
import MessageItem from '../components/menus/MessageItem';

const ErrorMessageApp = ({ route }) => {
    const [inputText, setInputText] = useState('');
    const [curentUserState, setCurentUserState] = useState([]);
    const { app } = route.params;
    const [messagesData, setMessageData] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = useSelector((state) => state.auth.userId);
    const email = useSelector((state) => state.auth.email);
    const token = useSelector((state) => state.auth.token);

    const getUser = async (userId) => {
        const apiMesstechnik = new MesstechnikAPI(token);
        return await apiMesstechnik.getUserById(userId);
    };

    const fetchMessagesData = async () => {
        try {
            const apiMesstechnik = new MesstechnikAPI(token);
            let foundUser = await apiMesstechnik.getCurentUser(email);
            setCurentUserState(foundUser);

            let improvementSuggestion = await apiMesstechnik.getByApp(app);
            improvementSuggestion = await Promise.all(improvementSuggestion.map(async (el) => {
                let user = await getUser(el.senderId);
                return { ...el, sender: user };
            }));

            improvementSuggestion.sort((a, b) => a.id - b.id);
            setMessageData(improvementSuggestion);
            setLoading(false);
        } catch (error) {
            console.error("Napaka pri pridobivanju podatkov: ", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessagesData();
    }, [app]);

    const sendMessage = async () => {
        console.log("Sending message...");
        setInputText("");
        try {
            const apiMesstechnik = new MesstechnikAPI(token);
            let suggestionData = {
                id: 1,
                message: inputText,
                senderId: curentUserState.id,
                upvoteCount: 0,
                date: new Date(),
                status: "Not accepted",
                inhouseAppId: messagesData.length > 0 ? messagesData[0].inhouseAppId : null
            };

            const serverMessage = await apiMesstechnik.addMessage(suggestionData);
            console.log("Response from server:", serverMessage);

            fetchMessagesData();

        } catch (error) {
            console.error("Napaka pri pošiljanju sporočila:", error.message);
        }
    };

    const CustomButton = ({ onPress, title }) => (
        <TouchableOpacity
          onPress={onPress}
          style={{
            backgroundColor: '#0EA5E9',
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
            elevation: 5,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{title}</Text>
        </TouchableOpacity>
      );

    return (
        <View className="flex-1 bg-gray-100">
            <ScrollView className="flex-1 bg-gray-100 p-4">
                <View className="bg-white p-4 mb-4 shadow-lg flex-row items-center">
                    <ChartBarIcon size={20} color={"#0EA5E9"}/>
                <Text className="flex justify-center text-lg ml-2 font-semibold">{app}</Text>
                </View>
                
                {loading ? (
                    <Text className="text-center text-gray-600">Laden...</Text>
                ) : (
                    messagesData.map((msg, idx) => (
                        <MessageItem
                            key={idx}
                            name={msg.sender?.firstName}
                            surname={msg.sender?.lastName}
                            voteCount={msg?.upvoteCount}
                            date={msg?.date}
                            time="09:32"
                            message={msg?.message}
                            msg={msg}
                        />
                    ))
                )}
            </ScrollView>
            <View className="bg-white flex justify-center h-auto py-4 px-4">
                <View className="px-4 flex-row space-x-4">
                    <InformationCircleIcon color={"#0EA5E9"}/>
            <Text className="text-2xs mb-2">Hier kannst du Fehler melden und Verbesserungen vorschlagen.</Text>
            </View>
    <View className="bg-white border border-gray-200 rounded-lg p-5">
      <View className="flex-row items-center space-x-3">
        <View className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-2">
          <TextInput
            className="text-gray-800"
            placeholder="Schreiben.."
            placeholderTextColor="#9ca3af"
            onChangeText={setInputText}
            value={inputText}
            style={{ fontSize: 16 }}
          />
        </View>
        <View className="flex items-center">
          <CustomButton onPress={sendMessage} title="Teilen" />
        </View>
      </View>
    </View>
  </View>
        </View>
    );
}

export default ErrorMessageApp;