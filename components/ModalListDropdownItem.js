import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from 'react-native-heroicons/outline'; // Assuming you have heroicons installed

const ModalListDropdownItem = ({ text, icon, iconColor = "#000", textColor = "#000", onSelect, info, infoIcon, dropdownItems, selected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(selected);

  useEffect(() => {
    setSelectedValue(selected);
  }, [selected]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (item) => {
    setSelectedValue(item);
    setIsOpen(false);
    onSelect(item);
  };

  return (
    <View className="bg-gray-50 m-2 rounded-xl shadow-md">
      <TouchableOpacity className="flex-row bg-white rounded-xl p-4" onPress={toggleDropdown}>
        <View className="flex-col justify-center mr-4">
          {React.cloneElement(icon, { color: iconColor })}
        </View>
        <View className="flex-1">
          <Text className="font-medium text-md" style={{ color: textColor }}>Status: {selectedValue}</Text>
          {info && (
            <View className="flex-row items-center mt-1">
              {infoIcon}
              <Text className="text-sm text-blue-300 ml-2 italic">{info}</Text>
            </View>
          )}
        </View>
        <View className="flex-col justify-center ml-4">
          <ChevronDownIcon size={22} color={iconColor} />
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View className="bg-white rounded-xl p-4 mt-2">
          {dropdownItems.map((item, index) => (
            <TouchableOpacity key={index} className="p-2" onPress={() => handleSelect(item)}>
              <Text className="text-md" style={{ color: textColor }}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

    </View>
  );
};

export default ModalListDropdownItem;