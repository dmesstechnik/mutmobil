import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CheckBox } from "react-native-elements/dist/checkbox/CheckBox";
import { TextInput } from "react-native-gesture-handler";
import {
  CheckIcon,
  ClockIcon,
  GlobeEuropeAfricaIcon,
  MapPinIcon,
  MoonIcon,
  SunIcon,
  ViewColumnsIcon,
} from "react-native-heroicons/outline";
import { Modal, Portal } from "react-native-paper";
import { useSelector } from "react-redux";
import MesstechnikAPI from "../API/MesstechnikAPI";
import { MAX_HOUR, MIN_HOUR } from "../config/config";

// ⬇️ all db logic is now imported
import StempelAPI from "../API/StempelAPI";
import {
  createAppConfigTable,
  createClocksTable,
  getAllUsersFromClocks,
  getAppConfig,
  saveClockData,
} from "../database/CloksDb";

// Screen dimensions
const { width } = Dimensions.get("window");

const TimeButton = ({ label, onPress, time, buttonStyle, textStyle, icon }) => (
  <View className="flex-row items-center mb-4">
    <TouchableOpacity
      className={`flex-1 p-4 rounded-lg flex-row ${buttonStyle}`}
      onPress={onPress}
    >
      {icon}
      <Text className={`text-lg font-semibold ml-2 ${textStyle}`}>{label}</Text>
    </TouchableOpacity>
    <View className="ml-4 p-2 bg-gray-100 rounded-lg">
      <Text className="text-lg text-gray-700">{time || "/"}</Text>
    </View>
  </View>
);

const StemplApp = () => {
  const [times, setTimes] = useState({
    clockIn: null,
    startBreakfast: null,
    endBreakfast: null,
    clockOut: null,
    startBreak1: null,
    endBreak1: null,
    startBreak2: null,
    endBreak2: null,
  });

  const [buttonVisibility, setButtonVisibility] = useState({
    clockIn: true,
    startBreakfast: true,
    endBreakfast: true,
    clockOut: true,
    startBreak1: false,
    endBreak1: false,
    startBreak2: false,
    endBreak2: false,
  });

  const [awayDaysActive, setAwayDaysActive] = useState(false);
  const [serverRequest, setServerRequest] = useState(false);
  const navigation = useNavigation();
  const userId = useSelector((state) => state.auth.userId);
  const mtanr = useSelector((state) => state.auth.userId);
  const authToken = useSelector((state) => state.auth.token);
  const userEmail = useSelector((state) => state.auth.email);
  const userTextPassword = useSelector((state) => state.auth.textPassword);
  const [currentTime, setCurrentTime] = useState("");
  const [place, setPlace] = useState("");
  const [modalVisibleMorning, setModalMorningVisible] = useState(false);
  const [modalVisibleAfternoon, setModalAfternoonVisible] = useState(false);
  const [additionalInfoMorning, setAdditionalInfoMorning] = useState("");
  const [additionalInfoAfternoon, setAdditionalInfoAfternoon] = useState("");
  const [lastPressedKey, setLastPressedKey] = useState("");
  const [uploadKey, setUploadKey] = useState(null);
  const [selectedCheckBox, setSelectedCheckBox] = useState({
    sleptThere: false,
    wasReading: false,
    wasMounting: false,
    other: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(formattedTime);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getAppConfigFromServer = async () => {
    try {
      let apiMesstechnik = new MesstechnikAPI(authToken);
      let appConfigs = await apiMesstechnik.getAppConfigByUserId(userId);
      console.log("appConfigs:" + JSON.stringify(appConfigs));
    } catch (error) {
      console.error(
        "Error fetching app configurations from server:",
        error.message
      );
    }
  };


  useEffect(() => {
    getAppConfigFromServer();
    createAppConfigTable();
    getAppConfig();
  }, []);

  const handlePress = async (key) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const currentTime = new Date().toLocaleTimeString();
      const now = new Date();
      const currentHour = now.getHours();

      console.log("Current hour:", currentHour + " Key:" + key);

      if (currentHour < MIN_HOUR && key === "clockIn" && !modalVisibleMorning) {
        setModalMorningVisible(true);
        setLastPressedKey(key);
        return;
      }

      if (
        currentHour > MAX_HOUR &&
        key === "clockOut" &&
        !modalVisibleAfternoon
      ) {
        setModalAfternoonVisible(true);
        setLastPressedKey(key);
        return;
      }

      setTimes((prevTimes) => {
        const updatedTimes = { ...prevTimes, [key]: currentTime };
        const nextButtonVisibility = { ...buttonVisibility };
        if (key === "clockIn") nextButtonVisibility.startBreakfast = true;
        if (key === "startBreakfast") nextButtonVisibility.endBreakfast = true;
        if (key === "endBreakfast")
          (nextButtonVisibility.clockOut = true), setServerRequest(true);
        if (key === "clockOut") nextButtonVisibility.startBreak1 = true;
        if (key === "startBreak1") nextButtonVisibility.endBreak1 = true;
        if (key === "endBreak1") nextButtonVisibility.startBreak2 = true;
        if (key === "startBreak2") nextButtonVisibility.endBreak2 = true;

        setButtonVisibility(nextButtonVisibility);
        saveClockData(updatedTimes, today, userId);
        return updatedTimes;
      });

      setUploadKey(key);
    } catch (error) {
      console.error("Error saving time:", error);
    }
  };

  useEffect(() => {
    if (uploadKey) {
      uploadData(uploadKey);
      setUploadKey(null);
    }
  }, [times, uploadKey]);

  const saveMorningReason = async (morningReason) => {
    await uploadData("clockIn");
    let stempelApi = new StempelAPI(authToken);
    stempelApi.saveInfo({bemerkung:morningReason, type:"early"});
  }


  const saveAfternoonReason = async (afternoonReason) => {
    await uploadData("clockOut");
    let stempelApi = new StempelAPI(authToken);
    stempelApi.saveInfo({bemerkung:afternoonReason, type:"late"});
  }

const saveDestinationData = async () => {
  try {
    // Map selected checkboxes to their labels
    const labelMapping = {
      wasReading: "Ablesung",
      wasMounting: "Montage",
      other: "Sonstiges",
      sleptThere: "Nächtigung",
    };

    const itemsSelected = Object.entries(selectedCheckBox)
      .filter(([_, value]) => value)
      .map(([key]) => labelMapping[key]);

    const additionalText = itemsSelected.join(", ");

    // Prepare payload
    const payload = {
      destinations: `${additionalText} : ${place}`,
      destOvernight: selectedCheckBox.sleptThere,
    };

    // Send request
    const stempelAPI = new StempelAPI(authToken);
    await stempelAPI.saveDestination(payload);

    console.log("Destination saved successfully");
  } catch (error) {
    console.error("Failed to save destination:", error);
  }
};


  const uploadData = async (type) => {
    const now = new Date();
    const currentHour = now.getHours();

    console.log("=============== UPLOADING ===============|");

    let placetxtOk = place;
    let afternoon_reason = additionalInfoAfternoon;
    let morning_reason = additionalInfoMorning;
    let boxSelected = true;
    let timeOk = true;


    let stempelAPI = new StempelAPI(authToken);

    if (type === "clockIn") {
      stempelAPI.clockIn();
    } else if (type === "startBreakfast") {
      stempelAPI.startMealBreak();
    } else if (type === "endBreakfast") {
      stempelAPI.endMealBreak();
    } else if (type === "clockOut") {
      stempelAPI.clockOut();
    } else if (type === "startBreak1") {
      stempelAPI.startFirstBreak();
    } else if (type === "endBreak1") {
      stempelAPI.endFirstBreak();
    } else if (type === "startBreak2") {
      stempelAPI.startSecondBreak();
    } else if (type === "endBreak2") {
      stempelAPI.endSecondBreak();
    }
  };

  useEffect(() => {
    const init = async () => {
      await createClocksTable();
      const today = new Date().toISOString().split("T")[0];
      const usersData = getAllUsersFromClocks();
      const filteredData = usersData.filter(
        (item) => item.user === userId && item.clock_date === today
      );

      if (filteredData.length > 0) {
        setTimes(filteredData[0]);
      }
      console.log("Filtered data:", JSON.stringify(filteredData));
    };

    checkInternetAndExecute();
    init();
  }, []);

  const checkInternetConnection = async () => {
    try {
      const response = await fetch("https://www.google.com", {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const checkInternetAndExecute = async () => {
    const isConnected = await checkInternetConnection();
    if (!isConnected) {
      console.log(" No internet connection! Calling functions...");
    } else {
      console.log(" Internet connection established.");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: width * 0.05,
        paddingTop: 1,
        backgroundColor: "#FFFFFF",
      }}
    >
      <View className="flex flex-row items-center self-center">
        <ClockIcon size={50} color="#3B82F6" />
        <Text className="text-4xl font-bold text-gray-800 mb-5 text-center mt-8 ml-4">{`Stempeln`}</Text>
      </View>

      {/* buttons */}
      <View className="mb-5">
        {buttonVisibility.clockIn && (
          <TimeButton
            label="Arbeitsbeginn"
            icon={<SunIcon size={30} color={"white"} />}
            onPress={() => handlePress("clockIn")}
            time={
              times?.clockIn && times.clockIn.trim() !== ""
                ? times.clockIn
                : "/"
            }
            buttonStyle="bg-blue-500 p-4 rounded-lg"
            textStyle="text-white text-lg"
          />
        )}

        {buttonVisibility.startBreakfast && (
          <TimeButton
            label="Beginn Mittagspause"
            icon={<ViewColumnsIcon size={30} color={"white"} />}
            onPress={() => handlePress("startBreakfast")}
            time={
              times?.startBreakfast && times.startBreakfast.trim() !== ""
                ? times.startBreakfast
                : "/"
            }
            buttonStyle="bg-blue-500 p-4 rounded-lg mt-4"
            textStyle="text-white text-lg"
          />
        )}

        {buttonVisibility.endBreakfast && (
          <TimeButton
            label="Ende Mittagspause"
            icon={<ViewColumnsIcon size={30} color={"white"} />}
            onPress={() => handlePress("endBreakfast")}
            time={
              times?.endBreakfast && times.endBreakfast.trim() !== ""
                ? times.endBreakfast
                : "/"
            }
            buttonStyle="bg-blue-500 p-4 rounded-lg mt-4"
            textStyle="text-white text-lg"
          />
        )}

        {buttonVisibility.clockOut && (
          <TimeButton
            label="Arbeitsende"
            icon={<MoonIcon size={30} color={"white"} />}
            onPress={() => handlePress("clockOut")}
            time={
              times?.clockOut && times.clockOut.trim() !== ""
                ? times.clockOut
                : "/"
            }
            buttonStyle="bg-blue-500 p-4 rounded-lg mt-4"
            textStyle="text-white text-lg"
          />
        )}
      </View>

      {/* Tabs */}
      <View className="flex w-full flex-row">
        <TouchableOpacity
          className={`w-1/3 p-2 rounded-lg items-center flex-row ${
            awayDaysActive ? "border-b-blue-500 border-b-2" : ""
          }`}
          onPress={() => setAwayDaysActive((prev) => !prev)}
        >
          <GlobeEuropeAfricaIcon size={35} color="black" />
          <Text className={`font-semibold text-lg pl-2`}>Auswärtstage</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`w-1/3 p-2 pl-7 items-center flex-row ${
            !awayDaysActive ? "border-b-blue-500 border-b-2" : ""
          }`}
          onPress={() => setAwayDaysActive((prev) => !prev)}
        >
          <ClockIcon size={35} color="black" />
          <Text className="font-semibold text-lg pl-2">Unterbrechungen</Text>
        </TouchableOpacity>
      </View>

      {/* Away Days */}
      {awayDaysActive && (
        <View className="mb-5 p-5 pl-0">
          <Text className="pl-4 pb-2 text-lg">Tätigkeiten und Orte</Text>
          <CheckBox
            title="Nächtigung"
            checked={selectedCheckBox.sleptThere}
            onPress={() =>
              setSelectedCheckBox((prev) => ({
                ...prev,
                sleptThere: !prev.sleptThere,
              }))
            }
          />
          <Text className="pl-4 pt-2 pb-2 text-lg">Tätigkeit auswählen</Text>
          <CheckBox
            title="Ablesung"
            checked={selectedCheckBox.wasReading}
            onPress={() =>
              setSelectedCheckBox((prev) => ({
                ...prev,
                wasReading: !prev.wasReading,
              }))
            }
          />
          <CheckBox
            title="Montage"
            checked={selectedCheckBox.wasMounting}
            onPress={() =>
              setSelectedCheckBox((prev) => ({
                ...prev,
                wasMounting: !prev.wasMounting,
              }))
            }
          />
          <CheckBox
            title="Sonstiges"
            checked={selectedCheckBox.other}
            onPress={() =>
              setSelectedCheckBox((prev) => ({ ...prev, other: !prev.other }))
            }
          />
          <View className="flex flex-row w-full items-center m-4">
            <MapPinIcon size={30} color="black" />
            <TextInput
              onChangeText={setPlace}
              className="border-b-2 p-2 m-3 w-10/12 font-bold"
              value={place}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              saveDestinationData();
            }}
            className="bg-blue-500 p-3 w-5/12 flex items-center self-center rounded-md mt-4"
          >
            <Text className="text-white text-bold">Speichern</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Breaks */}
      {!awayDaysActive && (
        <View className="mb-5 mt-8">
          <TimeButton
            label="Beginn Unterbrechung 1"
            icon={<ClockIcon size={30} color={"white"} />}
            onPress={() => handlePress("startBreak1")}
            time={
              times?.startBreak1 && times.startBreak1.trim() !== ""
                ? times.startBreak1
                : "/"
            }
            buttonStyle="bg-blue-500 p-4 rounded-lg"
            textStyle="text-white text-lg"
          />
          <TimeButton
            label="Ende Unterbrechung 1"
            icon={<ClockIcon size={30} color={"white"} />}
            onPress={() => handlePress("endBreak1")}
            time={
              times?.endBreak1 && times.endBreak1.trim() !== ""
                ? times.endBreak1
                : "/"
            }
            buttonStyle="bg-blue-500 p-4 rounded-lg mt-4"
            textStyle="text-white text-lg"
          />
          <TimeButton
            label="Beginn Unterbrechung 2"
            icon={<ClockIcon size={30} color={"white"} />}
            onPress={() => handlePress("startBreak2")}
            time={
              times?.startBreak2 && times.startBreak2.trim() !== ""
                ? times.startBreak2
                : "/"
            }
            buttonStyle="bg-blue-500 p-4 rounded-lg mt-4"
            textStyle="text-white text-lg"
          />
          <TimeButton
            label="Ende Unterbrechung 2"
            icon={<ClockIcon size={30} color={"white"} />}
            onPress={() => handlePress("endBreak2")}
            time={
              times?.endBreak2 && times.endBreak2.trim() !== ""
                ? times.endBreak2
                : "/"
            }
            buttonStyle="bg-blue-500 p-4 rounded-lg mt-4"
            textStyle="text-white text-lg"
          />
        </View>
      )}

      {/* Morning Modal */}
      <Portal>
        <Modal
          visible={modalVisibleMorning}
          onDismiss={() => setModalMorningVisible(false)}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
            borderRadius: 12,
          }}
        >
          <Text className="text-xl font-semibold mb-4 text-gray-800">
            Bitte geben Sie den Grund für das Einstempeln vor 7 Uhr morgens an.
          </Text>
          <TextInput
            placeholder="Grund eingeben.."
            value={additionalInfoMorning}
            onChangeText={setAdditionalInfoMorning}
            className="border-b-2 border-gray-300 p-2 mb-4 text-gray-800"
          />
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-md w-1/3 flex flex-row items-center justify-center self-center"
            onPress={() => {
              if (additionalInfoMorning.trim() === "") {
                alert("Bitte geben Sie den Grund an.");
                return;
              }
              setModalMorningVisible(false);
              saveMorningReason(additionalInfoMorning);
            }}
          >
            <CheckIcon size={25} color={"white"} />
            <Text className="text-white ml-2">OK</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>

      {/* Afternoon Modal */}
      <Portal>
        <Modal
          visible={modalVisibleAfternoon}
          onDismiss={() => setModalAfternoonVisible(false)}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 20,
            borderRadius: 12,
          }}
        >
          <Text className="text-xl font-semibold mb-4 text-gray-800">
            Bitte geben Sie den Grund für das Ausstempeln nach 18 Uhr an.
          </Text>
          <TextInput
            placeholder="Grund eingeben.."
            value={additionalInfoAfternoon}
            onChangeText={setAdditionalInfoAfternoon}
            className="border-b-2 border-gray-300 p-2 mb-4 text-gray-800"
          />
          <TouchableOpacity
            className="bg-blue-500 p-3 rounded-md w-1/3 flex flex-row items-center justify-center self-center"
            onPress={() => {
              if (additionalInfoAfternoon.trim() === "") {
                alert("Bitte geben Sie den Grund an.");
                return;
              }
              setModalAfternoonVisible(false);
              saveAfternoonReason(additionalInfoAfternoon)
            }}
          >
            <CheckIcon size={25} color={"white"} />
            <Text className="text-white ml-2">OK</Text>
          </TouchableOpacity>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

export default StemplApp;

const styles = StyleSheet.create({});
