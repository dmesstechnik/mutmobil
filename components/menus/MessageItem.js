import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CalendarIcon, ClockIcon, HandThumbUpIcon, UserCircleIcon } from 'react-native-heroicons/outline';
import { useSelector } from 'react-redux';
import MesstechnikAPI from '../../API/MesstechnikAPI';

const MessageItem = ({ name, surname, date, time, message, voteCount, msg }) => {
  const [stateVoteCount, setStateVoteCount] = useState(voteCount);
  const token = useSelector((state) => state.auth.token);

  const saveNumberOfLikes = () => {
    const fetchMessagesData = async () => {
      try {
        const apiMesstechnik = new MesstechnikAPI(token);
        await apiMesstechnik.saveMessageLikes(msg, () => {
          setStateVoteCount((val) => val + 1);
        }, () => {});
      } catch (error) {
        console.error("Error retrieving data: ", error);
      }
    };

    fetchMessagesData();
  };

 const changeToUeDate = (date) => {
  if (!date) return null;

  // Split yyyy-mm-dd
  const parts = date.split("-");
  if (parts.length !== 3) return null;

  const [year, month, day] = parts.map(Number);

  // Validate numbers
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

  // Format as dd.mm.yyyy
  const formattedDay = String(day).padStart(2, "0");
  const formattedMonth = String(month).padStart(2, "0");
  const formattedYear = String(year);

  return `${formattedDay}.${formattedMonth}.${formattedYear}`;
};


  const formattedDate = changeToUeDate(date);

  return (
    <View className="shadow-lg rounded-lg bg-white p-5 mt-5 mx-4">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center flex-1">
          <UserCircleIcon size={30} color="#4A4A4A" />
          <Text
            className="ml-3 font-semibold flex-1"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: '#0EA5E9', fontSize: 13 }} // smaller for small iPhones
          >
            {name} {surname}
          </Text>
        </View>
        <View className="flex-row items-center">
          {formattedDate && (
            <View className="flex-row items-center mr-4">
              <CalendarIcon size={20} color="#4A4A4A" />
              <Text className="ml-1 text-gray-600 text-xs">{formattedDate}</Text>
            </View>
          )}
          {time && (
            <View className="flex-row items-center">
              <ClockIcon size={20} color="#4A4A4A" />
              <Text className="ml-1 text-gray-600 text-xs">{time}</Text>
            </View>
          )}
        </View>
      </View>
      <Text className="text-gray-700 mb-4">{message}</Text>
      <View className="flex-row justify-end">
        <TouchableOpacity
          onPress={saveNumberOfLikes}
          className="flex-row items-center bg-gray-100 p-2 rounded-lg"
        >
          <Text className="mr-2 text-gray-600 font-semibold text-xs">
            {stateVoteCount} Haben auch das Problem
          </Text>
          <HandThumbUpIcon size={20} color="#4A4A4A" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageItem;
