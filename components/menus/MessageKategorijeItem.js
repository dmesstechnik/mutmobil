import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ComputerDesktopIcon } from 'react-native-heroicons/solid';

const MessageKategorijeItem = ({ name }) => {
    const navigation = useNavigation();
    const { width, height } = useWindowDimensions();

   

    const handlePress = () => {
 
        navigation.navigate("InhouseApps", { app: name });
    };

    return (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
            <View
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f3f4f6', 
                    elevation: 5,

                }}
            >
                <ComputerDesktopIcon size={70} color="black" />
                <Text
                    style={{
                        marginTop: 10,
                        fontWeight: 'bold',
                        color: '#3b82f6', // Blue color for text
                        textAlign: 'center',
                    }}
                >
                    {name}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default MessageKategorijeItem;
