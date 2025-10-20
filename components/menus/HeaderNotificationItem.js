import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MapIcon, SunIcon} from 'react-native-heroicons/outline'; // Assuming you have heroicons installed

const HeaderNotificationItem = ({ name, onAllow, onDeny, button}) => {
  return (
    <View className="flex-1 justify-center items-center p-5 bg-white rounded-lg shadow-lg border border-gray-200">
        <SunIcon size={30} color="orange"/>
      {name}
      <View className="flex-row mt-5 space-x-4">
        {button}
      </View>
    </View>
  );
};

export default HeaderNotificationItem;