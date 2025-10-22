import { useEffect, useState } from "react";
import {
    Dimensions,
    ScrollView,
    Text,
    View,
} from "react-native";
import { useSelector } from "react-redux";
import { getAllUsersFromClocks } from "../database/CloksDb";

const { width } = Dimensions.get("window");

const StempelHistory = () => {
  const [clockRecords, setClockRecords] = useState([]);
  const userId = useSelector((state) => state.auth.userId);

  useEffect(() => {
    loadClockRecords();
  }, []);

  const loadClockRecords = () => {
    try {
      const allRecords = getAllUsersFromClocks();
      console.log("📊 All clock records:", allRecords);

      // Filter records for current user and sort by date (newest first)
      const userRecords = allRecords
        .filter((record) => {
          console.log("🔍 Checking record:", record);
          return record.user === userId;
        })
        .sort((a, b) => {
          const dateA = new Date(a.clock_date);
          const dateB = new Date(b.clock_date);
          return dateB - dateA;
        });

      console.log("✅ User records:", userRecords);
      setClockRecords(userRecords);
    } catch (error) {
      console.error("Error loading clock records:", error);
    }
  };

  const calculateWorkHours = (record) => {
    if (!record.clockIn || !record.clockOut) return "N/A";

    try {
      const parseTime = (timeStr) => {
        if (!timeStr) return null;
        const [hours, minutes, seconds] = timeStr.split(":");
        return parseInt(hours) * 60 + parseInt(minutes);
      };

      const clockInMinutes = parseTime(record.clockIn);
      const clockOutMinutes = parseTime(record.clockOut);
      const breakfastMinutes = record.startBreakfast && record.endBreakfast
        ? parseTime(record.endBreakfast) - parseTime(record.startBreakfast)
        : 0;
      const break1Minutes = record.startBreak1 && record.endBreak1
        ? parseTime(record.endBreak1) - parseTime(record.startBreak1)
        : 0;
      const break2Minutes = record.startBreak2 && record.endBreak2
        ? parseTime(record.endBreak2) - parseTime(record.startBreak2)
        : 0;

      const totalWorkMinutes = clockOutMinutes - clockInMinutes - breakfastMinutes - break1Minutes - break2Minutes;
      const hours = Math.floor(totalWorkMinutes / 60);
      const minutes = totalWorkMinutes % 60;

      return `${hours}h ${minutes}m`;
    } catch (error) {
      return "N/A";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";

    try {
      // Handle different date formats
      let date;

      // If it's in DD.MM.YYYY format
      if (dateStr.includes('.')) {
        const [day, month, year] = dateStr.split('.');
        date = new Date(year, month - 1, day);
      }
      // If it's in YYYY-MM-DD format
      else if (dateStr.includes('-')) {
        date = new Date(dateStr);
      }
      // Try parsing as-is
      else {
        date = new Date(dateStr);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateStr);
        return dateStr; // Return original string if can't parse
      }

      const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
      const dayName = days[date.getDay()];
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${dayName}, ${day}.${month}.${year}`;
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return dateStr; // Return original string if error
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#F3F4F6" }}
      contentContainerStyle={{
        flexGrow: 1,
        padding: width * 0.05,
        paddingTop: 20,
      }}
    >

      {clockRecords.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8">
          <Text className="text-gray-500 text-lg text-center">
            Keine Stempelzeiten gefunden
          </Text>
        </View>
      ) : (
        clockRecords.map((record, index) => (
          <View
            key={index}
            className="bg-white rounded-xl p-4 mb-4 shadow"
          >
            {/* Date Header */}
            <View className="border-b border-gray-200 pb-3 mb-3">
              <Text className="text-lg font-bold text-gray-800">
                {formatDate(record.clock_date)}
              </Text>
            </View>

            {/* Work Times */}
            <View className="space-y-2">
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600">Arbeitsbeginn:</Text>
                <Text className="text-gray-800 font-semibold">
                  {record.clockIn || "-"}
                </Text>
              </View>

              {record.startBreakfast && (
                <View className="flex-row justify-between items-center py-2 bg-gray-50 px-2 rounded">
                  <Text className="text-gray-600">Mittagspause:</Text>
                  <Text className="text-gray-800">
                    {record.startBreakfast} - {record.endBreakfast || "-"}
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between items-center py-2">
                <Text className="text-gray-600">Arbeitsende:</Text>
                <Text className="text-gray-800 font-semibold">
                  {record.clockOut || "-"}
                </Text>
              </View>

              {record.startBreak1 && (
                <View className="flex-row justify-between items-center py-2 bg-gray-50 px-2 rounded">
                  <Text className="text-gray-600">Unterbrechung 1:</Text>
                  <Text className="text-gray-800">
                    {record.startBreak1} - {record.endBreak1 || "-"}
                  </Text>
                </View>
              )}

              {record.startBreak2 && (
                <View className="flex-row justify-between items-center py-2 bg-gray-50 px-2 rounded">
                  <Text className="text-gray-600">Unterbrechung 2:</Text>
                  <Text className="text-gray-800">
                    {record.startBreak2} - {record.endBreak2 || "-"}
                  </Text>
                </View>
              )}

              {/* Total Hours */}
              <View className="border-t border-gray-200 pt-3 mt-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-blue-600 font-bold text-lg">
                    Gesamtstunden:
                  </Text>
                  <Text className="text-blue-600 font-bold text-lg">
                    {calculateWorkHours(record)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default StempelHistory;
