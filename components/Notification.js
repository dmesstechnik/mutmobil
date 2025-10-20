import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { BellIcon, MapIcon } from 'react-native-heroicons/outline'; // Assuming you have heroicons installed

const Notification = ({ text, icon, iconColor = "#000", textColor = "#000", onPress, buttonText, textSize="text-sm", buttonIcon}) => {
  return (
    <TouchableOpacity
      className="flex-col items-center justify-between bg-white p-4 rounded-lg shadow-lg mt-4"
      onPress={onPress}
    >
      <View className="flex-row items-center">
        {React.cloneElement(icon, { color: iconColor })}
        <Text className={`font-semibold ml-2 ${textSize}`} style={{ color: textColor }}>{text}</Text>
      </View>

   {/*    {onPress && <TouchableOpacity className="bg-blue-500 py-2 px-4 rounded-lg flex-row items-center">
          {buttonIcon}
          <Text className="text-white text-sm font-bold text-center ml-2">{buttonText}</Text>
        </TouchableOpacity>} */}
  
    </TouchableOpacity>
  );
};

export default Notification;