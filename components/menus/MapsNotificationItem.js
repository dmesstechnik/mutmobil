import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapIcon, SunIcon} from 'react-native-heroicons/outline'; // Assuming you have heroicons installed

const MapsNotificationItem = ({ name, onAllow, onDeny, button}) => {
  return (
    <View className="flex-1 justify-center items-center p-5 bg-white rounded-lg shadow-lg border border-gray-200">
        <SunIcon size={30} color="orange"/>
      {name}
      <View className="flex-row mt-5 space-x-4">
        <TouchableOpacity className="bg-blue-500 py-2 px-4 rounded-lg flex-row items-center" onPress={onAllow}>
          <MapIcon size={20} color="white" />
          <Text className="text-white text-sm font-bold text-center ml-2">Öffnen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MapsNotificationItem;