import { Text, TouchableOpacity, View } from "react-native";

const LeftDrawerItem = ({ title, screen, icon, navigation }) => {
  const openScreen = () => {
    navigation.navigate(screen);
    navigation.closeDrawer();
  };

  return (
    <View className="bg-gray-50 h-20 m-2 rounded-xl shadow-md">
      <TouchableOpacity className="flex-row h-20 bg-white rounded-xl" onPress={openScreen}>
        <View className="flex-col justify-center ml-4">
          {icon ? icon : null}
        </View>
        <Text className="font-medium text-lg self-center pl-3">{title}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LeftDrawerItem;
