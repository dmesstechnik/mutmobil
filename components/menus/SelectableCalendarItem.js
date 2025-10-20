import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment'; 
import { Button } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window'); 

const FullScreenCalendar = () => {
  const [selectedDate1, setSelectedDate1] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(null);
  const [datesInRange, setDatesInRange] = useState([]);

  const handleDayPress = (day) => {
    if (!selectedDate1 || (selectedDate1 && selectedDate2)) {
      setSelectedDate1(day.dateString);
      setSelectedDate2(null);
      setDatesInRange([]);
    } else if (!selectedDate2) {
      setSelectedDate2(day.dateString);
      calculateDatesInRange(selectedDate1, day.dateString);
    }
  };

  const calculateDatesInRange = (start, end) => {
    const range = [];
    let currentDate = moment(start);
    const endDate = moment(end);

    while (currentDate <= endDate) {
      range.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }

    setDatesInRange(range);
  };

  useEffect (() => {
    
  }, [selectedDate2]); 

  return (
    <View style={{ backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 20 }}>
      
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate1]: { selected: true, selectedColor: '#6082B6' },
          [selectedDate2]: { selected: true, selectedColor: '#6082B6' },
          ...datesInRange.reduce((acc, date) => {
            acc[date] = { selected: true, selectedColor: '#A9CCE3' };
            return acc;
          }, {}),
        }}
        theme={{
          todayTextColor: '#6082B6',
          selectedDayBackgroundColor: '#6082B6',
          selectedDayTextColor: '#ffffff',
          arrowColor: '#6082B6',
          monthTextColor: '#6082B6',
          textDayFontFamily: 'Helvetica',
          textMonthFontFamily: 'Helvetica-Bold',
          textDayHeaderFontSize: 16,
          textMonthFontSize: 24,
          textDayFontSize: 18,
        }}
        style={{ width: width - 40, height: 450, backgroundColor: 'white', borderRadius: 15, shadowColor: '#818589', shadowOpacity: 0.5, shadowRadius: 10, elevation: 8, padding: 10 }}
      />
      <TouchableOpacity className="items-center p-2 mx-1 bg-gray-100 rounded-lg mt-8">
                              <Text className="text-gray-800 text-sm font-bold text-center">Speichern</Text>
                          </TouchableOpacity>
    </View>
  );
};

export default FullScreenCalendar;
