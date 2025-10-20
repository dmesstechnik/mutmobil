import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { BellIcon, MapIcon } from 'react-native-heroicons/outline'; // Assuming you have heroicons installed

const ModalListItem = ({ text, icon, iconColor = "#000", textColor = "#000", onPress, info, infoIcon }) => {
  return (
    <View className="bg-gray-50 m-2 rounded-xl shadow-md">
      <TouchableOpacity className="flex-row bg-white rounded-xl p-4" onPress={onPress}>
        <View className="flex-col justify-center mr-4">

          {icon && React.cloneElement(icon, { color: iconColor })}
        </View>
        <View className="flex-1">
          <Text className="font-medium text-md" style={{ color: textColor }}>{text}</Text>
          {info && (
            <View className="flex-row items-center mt-1 self-center">
              {infoIcon}
              <Text className="text-sm text-blue-300 ml-2 italic">{info}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ModalListItem;