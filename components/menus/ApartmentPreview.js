import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector } from 'react-redux';
import MesstechnikAPI from '../../API/MesstechnikAPI';
import CameraButton from './CameraButton';

const ApartmentPreview = ({ apartment, onButtonPress, autoTrigger, workingTime }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [devicesOfApartments, setDevicesOfApartments] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editedDevice, setEditedDevice] = useState(null);
  const [timeDetails, setTimeDetails] = useState(null);
  const [updatedApartment, setUpdatedApartment] = useState(null);
  const userId = useSelector((state) => state.auth.userId);
  const token = useSelector((state) => state.auth.token);


  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        if (!token || !userId || !apartment) {
          return;
        }

        const apiMesstechnik = new MesstechnikAPI(token);

        const installerCalendarInfo = await apiMesstechnik.getInstallerCalendarInfoToDate(
          userId,
          new Date(),
          new Date()
        );

        if (isMounted && workingTime && apartment) {
          const currentDate = new Date().toISOString().split('T')[0];
          const calendarInfo = workingTime[currentDate];

          if (Array.isArray(calendarInfo)) {
            const timeInfo = calendarInfo.find(
              (entry) => entry?.apartmentNumber === apartment?.apartmentNumber && entry?.objectNumber === apartment?.objectNumber
            );

            if (timeInfo) {
              const updatedApartment = {
                ...apartment,
                timeFrom: timeInfo.timeFrom,
                timeTo: timeInfo.timeTo,
              };
              setUpdatedApartment(updatedApartment);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [apartment, token, userId, workingTime]);

  const getDevices = async () => {
    if (!token || !apartment?.id) {
      console.error('Missing token or apartment ID');
      return;
    }

    setIsLoading(true);
    try {
      const apiMesstechnik = new MesstechnikAPI(token);

      if (Array.isArray(devicesOfApartments) && devicesOfApartments.length === 0) {
        const devices = await apiMesstechnik.getDevicesByApartmentId(apartment.id);
        setDevicesOfApartments(Array.isArray(devices) ? devices : []);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
      setDevicesOfApartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonPress = () => {
    setEditModalVisible(false);
    setModalVisible(true);
    getDevices();

    if (onButtonPress) {
      onButtonPress(false);
    }
  };

  const handleDevicePress = (device) => {
    if (!device) return;

    setModalVisible(false);
    setSelectedDevice(device);
    setEditedDevice({ ...device });
    setEditModalVisible(true);
  };

  const handleSaveChanges = () => {
    if (!selectedDevice || !editedDevice) return;

    setDevicesOfApartments((prevDevices) =>
      Array.isArray(prevDevices) ? prevDevices.map((device) =>
        device?.deviceNumber === selectedDevice?.deviceNumber ? editedDevice : device
      ) : []
    );
    setModalVisible(true);
    setEditModalVisible(false);
  };

  const handleInputChange = (field, value) => {
    if (!field) return;
    setEditedDevice((prev) => ({ ...prev, [field]: value }));
  };

  if (!apartment) {
    return null;
  }

  return (
    <>
      <View className="bg-white rounded-lg p-4 mb-4 border border-[#899499] shadow-lg">


        <View className="flex-row items-center py-2 border-b border-[#D3D3D3]">
          <Icon name="user" size={20} color="#7393B3" />
          <Text className="text-base font-semibold text-[#555] ml-2">
            Vorname: {apartment?.firstName || 'N/A'}
          </Text>
        </View>
        <View className="flex-row items-center py-2 border-b border-[#D3D3D3]">
          <Icon name="user" size={20} color="#7393B3" />
          <Text className="text-base font-semibold text-[#555] ml-2">
            Nachname: {apartment?.lastName || 'N/A'}
          </Text>
        </View>
        <View className="flex-row py-2 border-b border-[#D3D3D3]">
          <Icon name="hashtag" size={20} color="#7393B3" />
          <Text className="text-base font-semibold text-[#555] ml-2">
            Nummer: {apartment?.apartmentNumber || 'N/A'}
          </Text>
        </View>
        <View className="flex-row items-center py-2 border-b border-[#D3D3D3]">
          <Icon name="building" size={20} color="#7393B3" />
          <Text className="text-base font-semibold text-[#555] ml-2">
            Stockwerk: {apartment?.floor || 'N/A'}
          </Text>
        </View>
        <View className="flex-row items-center py-2">
          <Icon name="clock-o" size={20} color="#7393B3" />
          <Text className="text-base font-semibold text-[#555] ml-2">
            Zeit: {updatedApartment?.timeFrom && updatedApartment?.timeTo
              ? `${updatedApartment.timeFrom} - ${updatedApartment.timeTo}`
              : 'Keine Zeitangaben'}
          </Text>
        </View>

        <TouchableOpacity onPress={handleButtonPress} className="mt-4 p-3 bg-[#7393B3] rounded-lg">
          <Text className="text-center text-white text-base font-semibold">{'Eintretten'}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-grey bg-opacity-50 pt-40">
          <View className="w-4/5 bg-white rounded-lg p-6 shadow-xl border-4 border-gray-400">
            <Text className="text-2xl font-bold text-center text-[#36454F] mb-6">Wohnungsgeräte</Text>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#7393B3" className="mt-6" />
              ) : Array.isArray(devicesOfApartments) && devicesOfApartments.length > 0 ? (
                devicesOfApartments.map((device, index) => (
                  device ? (
                    <TouchableOpacity key={device?.deviceId || index} onPress={() => handleDevicePress(device)}>
                      <View className="space-y-4 border-b pb-6 mb-8 border-[#E5E5E5] rounded-lg shadow-2xl bg-white">
                        <View className="px-6 py-4">
                          <Text className="text-lg font-semibold text-[#333] mb-2">Geräteinformation</Text>
                          <View className="flex-row items-center mb-3">
                            <Icon name="desktop" size={20} color="#7393B3" style={{ marginRight: 10 }} />
                            <Text className="text-sm font-medium text-[#333]">Gerätenummer:</Text>
                            <Text className="text-sm font-semibold text-[#5F6CAF]" style={{ marginLeft: 'auto' }}>
                              {device?.deviceNumber || 'N/A'}
                            </Text>
                          </View>
                          <View className="flex-row items-center mb-3">
                            <Icon name="home" size={20} color="#7393B3" style={{ marginRight: 10 }} />
                            <Text className="text-sm font-medium text-[#333]">Zimmer:</Text>
                            <Text className="text-sm font-semibold text-[#5F6CAF]" style={{ marginLeft: 'auto' }}>
                              {device?.room || 'N/A'}
                            </Text>
                          </View>
                          <View className="flex-row items-center mb-3">
                            <Icon name="cogs" size={20} color="#7393B3" style={{ marginRight: 10 }} />
                            <Text className="text-sm font-medium text-[#333]">Gerätetyp:</Text>
                            <Text className="text-sm font-semibold text-[#5F6CAF]" style={{ marginLeft: 'auto' }}>
                              {device?.deviceType || 'N/A'}
                            </Text>
                          </View>
                          <View className="flex-row items-center mb-3">
                            <Icon name="hashtag" size={20} color="#7393B3" style={{ marginRight: 10 }} />
                            <Text className="text-sm font-medium text-[#333]">Zählernummer:</Text>
                            <Text className="text-sm font-semibold text-[#5F6CAF]" style={{ marginLeft: 'auto' }}>
                              {device?.meterNumber || 'N/A'}
                            </Text>
                          </View>
                          <View className="flex-row items-center mb-3">
                            <Icon name="calendar" size={20} color="#7393B3" style={{ marginRight: 10 }} />
                            <Text className="text-sm font-medium text-[#333]">Installationsdatum:</Text>
                            <Text className="text-sm font-semibold text-[#5F6CAF]" style={{ marginLeft: 'auto' }}>
                              {device?.installationDate || 'N/A'}
                            </Text>
                          </View>
                          <View className="pr-80 mr-10 mt-5">
                            <View className="pr-20">
                              <CameraButton />
                            </View>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : null
                ))
              ) : (
                <Text className="text-center text-gray-500 mt-6">Keine Geräte gefunden</Text>
              )}
            </ScrollView>

            <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-6 p-3 bg-[#7393B3] rounded-lg">
              <Text className="text-center text-white text-base font-semibold">Schließen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={editModalVisible} transparent={true} animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-grey bg-opacity-50 pt-40">
          <View className="w-4/5 bg-white rounded-lg p-6 shadow-xl border-4 border-gray-400">
            <Text className="text-2xl font-bold text-center text-[#36454F] mb-6">Bearbeite Gerät</Text>
            <TextInput
              placeholder="Gerätenummer"
              value={editedDevice?.deviceNumber?.toString() || ''}
              onChangeText={(value) => handleInputChange('deviceNumber', value)}
              className="border border-gray-300 rounded-lg p-2 mb-4"
            />
            <TextInput
              placeholder="Zimmer"
              value={editedDevice?.room?.toString() || ''}
              onChangeText={(value) => handleInputChange('room', value)}
              className="border border-gray-300 rounded-lg p-2 mb-4"
            />
            <TextInput
              placeholder="Gerätetyp"
              value={editedDevice?.deviceType?.toString() || ''}
              onChangeText={(value) => handleInputChange('deviceType', value)}
              className="border border-gray-300 rounded-lg p-2 mb-4"
            />
            <TextInput
              placeholder="Zählernummer"
              value={editedDevice?.meterNumber?.toString() || ''}
              onChangeText={(value) => handleInputChange('meterNumber', value)}
              className="border border-gray-300 rounded-lg p-2 mb-4"
            />
            <TouchableOpacity onPress={handleSaveChanges} className="mt-6 p-3 bg-[#7393B3] rounded-lg">
              <Text className="text-center text-white text-base font-semibold">Speichern</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(true)} className="mt-4 p-3 bg-red-500 rounded-lg">
              <Text className="text-center text-white text-base font-semibold">Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ApartmentPreview;
