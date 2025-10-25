import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

const { width } = Dimensions.get('window');

const FullScreenCalendar = ({ headerColor = '#0EA5E9', onSubmit }) => {
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

  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const lightColor = lightenColor(headerColor, 60);

  const handleSubmit = () => {
    if (selectedDate1 && selectedDate2 && onSubmit) {
      onSubmit(selectedDate1, selectedDate2);
    }
  };

  useEffect(() => {
  }, [selectedDate2]);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          [selectedDate1]: { selected: true, selectedColor: headerColor },
          [selectedDate2]: { selected: true, selectedColor: headerColor },
          ...datesInRange.reduce((acc, date) => {
            acc[date] = { selected: true, selectedColor: lightColor };
            return acc;
          }, {}),
        }}
        theme={{
          todayTextColor: headerColor,
          selectedDayBackgroundColor: headerColor,
          selectedDayTextColor: '#ffffff',
          arrowColor: headerColor,
          monthTextColor: '#1F2937',
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontSize: 14,
          textMonthFontSize: 18,
          textDayFontSize: 16,
          textDayHeaderFontWeight: '600',
          textMonthFontWeight: '700',
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
        }}
        style={{
          width: width - 40,
          backgroundColor: 'white',
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
          padding: 10,
        }}
      />
      
      <TouchableOpacity
        style={{
          backgroundColor: headerColor,
          paddingVertical: 14,
          paddingHorizontal: 32,
          borderRadius: 12,
          marginTop: 20,
          width: width - 40,
          alignItems: 'center',
          shadowColor: headerColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
        activeOpacity={0.8}
        onPress={handleSubmit}
      >
        <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
          Antrag erstellen
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FullScreenCalendar;