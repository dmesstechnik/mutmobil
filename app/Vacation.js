import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { InformationCircleIcon } from 'react-native-heroicons/outline';
import SelectableCalendarItem from '../components/menus/SelectableCalendarItem';
import Notification from '../components/Notification';

const Vacation = () => {
  const [selected, setSelected] = useState("Vacation");
  const [hospitals, setHospitals] = useState(true);
  const [vacation, setVacation] = useState(false);
  const [hoursUsed, setHoursUsed] = useState(false);

  const setType = (selected) => {
    if (selected === "vacation") {
      setVacation(true);
      setHospitals(false);
      setHoursUsed(false);
    } else if (selected === "hospitals") {
      setHospitals(true);
      setVacation(false);
      setHoursUsed(false);
    } else if (selected === "hoursUsed") {
      setHoursUsed(true);
      setHospitals(false);
      setVacation(false);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-5">
      <View className="border-2 border-gray-50 rounded flex items-center">
        <Notification text={"Hier kannst du Anträge an die Firma stellen"} icon={<InformationCircleIcon/>}/>
      </View>

      <View className="flex-row justify-between w-full mt-5">
        <TouchableOpacity
          className={`flex-1 items-center p-4 mx-2 rounded-lg shadow-lg ${hospitals ? "bg-gray-100" : "bg-white"}`}
          onPress={() => setType("hospitals")}
        >
          <Text className="text-sm font-bold text-gray-800">Krank</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center p-4 mx-2 rounded-lg shadow-lg ${vacation ? "bg-gray-100" : "bg-white"}`}
          onPress={() => setType("vacation")}
        >
          <Text className="text-sm font-bold text-gray-800">Urlaub</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 items-center p-4 mx-2 rounded-lg shadow-lg ${hoursUsed ? "bg-gray-100" : "bg-white"}`}
          onPress={() => setType("hoursUsed")}
        >
          <Text className="text-sm font-bold text-gray-800">Zeitausgleich</Text>
        </TouchableOpacity>
      </View>

      <View>
        <SelectableCalendarItem />
      </View>
    </View>
  );
};

export default Vacation;