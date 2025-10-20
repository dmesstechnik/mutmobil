import { View, Text } from 'react-native';
import React from 'react';
import { UserCircleIcon } from 'react-native-heroicons/outline'; // Assuming you have heroicons installed

const Comment = ({ userId, title, poster, date, content }) => {
  return (
    <View className="bg-gray-50 m-2 rounded-xl shadow-md">
      <View className="flex-row bg-white rounded-xl p-4">
        <View className="flex-col justify-center mr-4">
          <UserCircleIcon size={32} color="#7393B3" />
        </View>
        <View className="flex-1">
          <Text className="font-medium text-md text-gray-800">{title}</Text>
          <Text className="text-sm text-sky-500">{poster}</Text>
          <Text className="text-xs text-gray-400">{date}</Text>
          <Text className="mt-2 text-gray-700">{content}</Text>
        </View>
      </View>
    </View>
  );
};

export default Comment;