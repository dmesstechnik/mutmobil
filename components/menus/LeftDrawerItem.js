import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

const LeftDrawerItem = ({ title, screen, icon }) => {
  const router = useRouter();

  const openScreen = () => {
    router.push(`/${screen}`);
  };

  return (
    <View className="bg-gray-50 h-20 m-2 rounded-xl shadow-md">
      <TouchableOpacity className="flex-row h-20 bg-white rounded-xl" onPress={openScreen}>
        <View className="flex-col justify-center ml-4">
          {icon}
        </View>
            <Text className="font-medium text-lg self-center pl-3">{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LeftDrawerItem;