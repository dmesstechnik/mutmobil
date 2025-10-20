import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Agenda, LocaleConfig } from "react-native-calendars";
import { ScrollView } from "react-native-gesture-handler";
import {
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CubeIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  HomeIcon,
  InformationCircleIcon,
  MapPinIcon,
  PhotoIcon,
  UserCircleIcon,
} from "react-native-heroicons/outline";
import { Card } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import MesstechnikAPI from "../components/API/MesstechnikAPI";
import ModalListDropdownItem from "../components/ModalListDropdownItem";
import ModalListItem from "../components/ModalListItem";
import { getTailwindColorForTicketStatus } from "../functions/StyleFunctions";
import {
  getTicketStatusId,
  getTicketStatusNames,
  getTicketStatusTitles,
} from "../functions/TextFunctions";

import Notification from "../components/Notification";

import FotosScreen from "./PhotoScreen";

const { height, width } = Dimensions.get("window");

LocaleConfig.locales["de"] = {
  monthNames: [
    "Januar",
    "Februar",
    "MÃ¤rz",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  monthNamesShort: [
    "Jan.",
    "Feb.",
    "MÃ¤rz",
    "Apr.",
    "Mai",
    "Juni",
    "Juli",
    "Aug.",
    "Sept.",
    "Okt.",
    "Nov.",
    "Dez.",
  ],
  dayNames: [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ],
  dayNamesShort: ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."],
  today: "Heute",
};
LocaleConfig.defaultLocale = "de";

const timeToString = (time) => {
  const date = new Date(time);
  return date.toISOString().split("T")[0];
};

function CalendarScreen({ navigation }) {
  const [items, setItems] = useState({});
  const [orderItems, setOrderItems] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState("null");
  const [openedOrder, setOpenedOrder] = useState({});

  const userId = useSelector((state) => state.auth.userId);
  const token = useSelector((state) => state.auth.token);
  const [selectedTab, setSelectedTab] = useState("Kunde");
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationData, setNotificationData] = useState({
    icon: null,
    text: null,
    color: null,
  });
  const [devices, setDevices] = useState([]);
  const [comments, setComments] = useState([{object:{}, apartement:{}, device:{}}]);
useEffect(() => {
  console.log("ðŸ“¦ openedOrder:", openedOrder);
}, [openedOrder]);

  const loadItems = useCallback(
    async (day) => {
      try {
        setItems({});
        const newItems = {};

        // Fetch the auth token
        if (!token) {
          console.error("Authentication token not found");
          return;
        }
        const apiMesstechnik = new MesstechnikAPI(token);

        const selectedDate = timeToString(day.timestamp);
        const selectedDateObj = new Date(day.timestamp);

        await apiMesstechnik.getInstallerCalendarInfoToDate(
          userId,
          selectedDateObj,
          selectedDateObj,
          (fetchedOrderInfo) => {
            const orders = fetchedOrderInfo[selectedDate] || [];

            // Parse timeFrom as full date-time objects for sorting
            orders.forEach((order) => {
              order.timeFromDate = new Date(
                `${selectedDate}T${order.timeFrom}`
              );
            });

            // Sort orders by timeFrom in ascending order
            orders.sort((a, b) => a.timeFromDate - b.timeFromDate);

            newItems[selectedDate] = orders
              .filter((order) => order.apartmentNumber)
              .map((order) => ({
                height: Math.max(10, Math.floor(Math.random() * 150)),
                day: selectedDate,
                door: order.doorNumber,
                apartmentOrder: order.apartmentOrderId,
                orderId: order.id,
                apartment: `${order.apartmentNumber}`,
                timeFrom: order.timeFrom,
                timeTo: order.timeTo,
                statusId: `${order.statusId}`,
                additionalInformation: `${
                  order.additionalInformation || "None"
                }`,
                objectNumber: order.objectNumber,
                location: order.location,
                activityNumber: order.activityNumber,
                firstName: order.firstName,
                lastName: order.lastName,
              }));

            // If no orders, add a default "No Appointments" entry
            if (newItems[selectedDate].length === 0) {
              newItems[selectedDate].push({
                name: "Keine Termine",
                height: 50,
                day: selectedDate,
                background: "gainsboro",
              });
            }

            setItems((prevItems) => ({
              ...prevItems,
              ...newItems,
            }));
          },
          (error) => {
            console.error("Error loading items: ", error);
          }
        );
      } catch (error) {
        console.error("Error loading items: ", error);
      }
    },
    [isLoaded]
  );

  const showNotification = (icon, text, color) => {
    setNotificationData({ icon, text, color });
    setNotificationVisible(true);
    setTimeout(() => {
      setNotificationVisible(false);
    }, 3000);
  };

  useEffect(() => {
    setIsLoaded(false);
  }, []);

  useEffect(() => {
    const doGetOrder = async () => {
      let messtechnikApi = new MesstechnikAPI(token);

      if (selectedItem && selectedItem.orderId != undefined) {
        let order = await messtechnikApi.getByOrderId(selectedItem.orderId);
        setOpenedOrder(order);
        console.log("order:"+order)
      }
    };

    doGetOrder();
  }, [selectedItem]);

  useEffect(() => {
    const fetchDevices = async () => {
      let messtechnikApi = new MesstechnikAPI(token);
      let apartment = await messtechnikApi.getApartmentByOrderId(
        selectedItem.apartmentOrder
    );
      if(selectedTab == "GerÃ¤te"){
         
            if (apartment) {
                let devices = await messtechnikApi.getDevicesByApartmentId(
                apartment.id
                );
                if (!devices) {
                showNotification(
                    <InformationCircleIcon size={15} color={"red"} />,
                    "Fehler beim Laden der GerÃ¤te",
                    "red"
                );
                }
                setDevices(devices);
            } else {
                showNotification(
                <InformationCircleIcon size={15} color={"red"} />,
                "Fehler beim Laden der Wohnung",
                "red"
                );
            }
        }else if(selectedTab == "Kommentare"){

            const fetchComments = async () => {
                let objectComments = await messtechnikApi.getObjectComments(selectedItem.objectNumber);
                let apartmentComments = await messtechnikApi.getApartmentComments(apartment?.id);
                let deviceComments = await Promise.all(devices.map(async (device) => {
                    return await messtechnikApi.getDeviceComments(device.deviceId);
                }));

                // Fetch user details for each comment
                const fetchUserDetails = async (comments) => {
                    return await Promise.all(comments.map(async (comment) => {
                        let user = await messtechnikApi.getUserById(comment.userId);
                        return { ...comment, poster: user.username };
                    }));
                };

                objectComments = await fetchUserDetails(objectComments);
                apartmentComments = await fetchUserDetails(apartmentComments);
                deviceComments = await Promise.all(deviceComments.map(fetchUserDetails));

                setComments({
                    object: objectComments,
                    apartment: apartmentComments,
                    device: deviceComments.flat()
                });
            };


            fetchComments();

            
        }
    };

    fetchDevices();
  }, [selectedTab]);

  const renderItem = (item) => {
    if (!item) {
      console.error("renderItem received null or undefined item");
      return null;
    }
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          borderRadius: 12,
          margin: 12,
          marginBottom: 20,
        }}
        onPress={() => {
          setSelectedItem(item);
          setModalVisible(true);
        }}
      >
        <Card
          style={{
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: "white",
          }}
        >
          <Card.Content style={{ padding: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              {/* User Info */}
              <View
                style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              >
                <Icon
                  name="account-circle"
                  size={32}
                  color={getTailwindColorForTicketStatus(item.statusId)}
                  style={{ marginRight: 12 }}
                />
                <View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#7393B3",
                    }}
                  >
                    {item.firstName} {item.lastName || ""}
                  </Text>
                  <Text style={{ fontSize: 16, color: "#6B7280" }}>
                    {item.apartment}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 8,
              }}
            >
              <Icon
                name="watch"
                size={22}
                color="#06B6D4"
                style={{ marginRight: 12 }}
              />
              <Text style={{ fontSize: 15, color: "#000000" }}>
                {item.timeFrom} - {item.timeTo}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 8,
              }}
            >
              <Icon
                name="target"
                size={22}
                color="#06B6D4"
                style={{ marginRight: 12 }}
              />
              <Text style={{ fontSize: 15, color: "#000000" }}>
                Status: {getTicketStatusNames(item.statusId)}
              </Text>
            </View>

            {/* Additional Info Section */}
            <View style={{ marginTop: 10 }}>
              {item.additionalInformation && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon
                    name="information-outline"
                    size={22}
                    color="#06B6D4"
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ fontSize: 16, color: "#06B6D4" }}>
                    {item.additionalInformation}
                  </Text>
                </View>
              )}

              {item.objectNumber && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon
                    name="cube-outline"
                    size={22}
                    color="#F97316"
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ fontSize: 16, color: "#F97316" }}>
                    {item.objectNumber}
                  </Text>
                </View>
              )}

              {item.location && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Icon
                    name="map-marker"
                    size={22}
                    color="#3B82F6"
                    style={{ marginRight: 12 }}
                  />
                  <Text style={{ fontSize: 16, color: "#3B82F6" }}>
                    {item.location}
                  </Text>
                </View>
              )}
            </View>
            <Button
              title="Details"
              onPress={() => {
                setSelectedItem(item);
                setModalVisible(true);
              }}
            />
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderDay = (day, item) => {
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: 36, // Adjusted width
          height: 36, // Adjusted height
          backgroundColor: "white",
          borderRadius: 18, // Adjusted border radius
          marginVertical: 8,
        }}
      >
        <Text style={{ fontSize: 14, color: "#4B5563" }}>
          {day ? day.day : ""}
        </Text>{" "}
        {/* Adjusted font size */}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        refreshControl={null}
        showClosingKnob={true}
        refreshing={false}
        renderItem={renderItem}
        markedDates={orderItems}
      />
      <StatusBar barStyle="dark-content" />

      <Modal
    animationType="slide"
    transparent={true}
    visible={modalVisible}
    onRequestClose={() => {
        setModalVisible(!modalVisible);
    }}
>
    <View className="flex-1 justify-center items-center">
        <View className="flex-1 bg-white p-6 pb-2 items-center shadow-lg w-full">
            {selectedItem && (
                <>
                    <Text className="text-2xl font-bold mb-5">
                        {selectedItem.firstName + " " + selectedItem.lastName}
                    </Text>
                    <View className="flex-row justify-between w-full mb-5">
                        <TouchableOpacity
                            className={`flex-1 items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Kunde" ? "border-b-2 border-blue-500" : ""}`}
                            onPress={() => setSelectedTab("Kunde")}
                        >
                            <UserCircleIcon size={22} color={selectedTab === "Kunde" ? "#3B82F6" : "#000"} />
                            <Text className={`text-xs text-center ml-2 ${selectedTab === "Kunde" ? "text-blue-500" : "text-gray-800"}`}>
                                Kunde
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "GerÃ¤te" ? "border-b-2 border-blue-500" : ""}`}
                            onPress={() => setSelectedTab("GerÃ¤te")}
                        >
                            <DevicePhoneMobileIcon size={22} color={selectedTab === "GerÃ¤te" ? "#3B82F6" : "#000"} />
                            <Text className={`text-xs text-center ml-2 ${selectedTab === "GerÃ¤te" ? "text-blue-500" : "text-gray-800"}`}>
                                GerÃ¤te
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Kommentare" ? "border-b-2 border-blue-500" : ""}`}
                            onPress={() => setSelectedTab("Kommentare")}
                        >
                            <ChatBubbleLeftRightIcon size={22} color={selectedTab === "Kommentare" ? "#3B82F6" : "#000"} />
                            <Text className={`text-xs text-center ml-2 ${selectedTab === "Kommentare" ? "text-blue-500" : "text-gray-800"}`}>
                                Kommentare
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Fotos" ? "border-b-2 border-blue-500" : ""}`}
                            onPress={() => setSelectedTab("Fotos")}
                        >
                            <PhotoIcon size={22} color={selectedTab === "Fotos" ? "#3B82F6" : "#000"} />
                            <Text className={`text-xs text-center ml-2 ${selectedTab === "Fotos" ? "text-blue-500" : "text-gray-800"}`}>
                                Fotos
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View className="items-center mb-2" style={{ flex: 1 }}>
                        {notificationVisible && (
                            <Notification
                                icon={<InformationCircleIcon size={15} color={notificationData.color} />}
                                text={notificationData.text}
                                textColor={notificationData.color}
                                iconColor={notificationData.color}
                            />
                        )}
                      
                        {selectedTab === "Kunde" && (
                            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                                <Text className="flex p-2 text-lg text-blue-300">Kunde</Text>
                                
                                
                    
                                <ModalListItem icon={<HomeIcon size={22} color="#7393B3" />} text={`Wohnung: ${selectedItem.apartment}`} />
                                <ModalListItem icon={<HomeIcon size={22} color="#7393B3" />} text={`TÃ¼r: ${selectedItem.door}`} />
                                <ModalListItem icon={<CubeIcon size={22} color="#7393B3" />} text={`Objektnummer: ${selectedItem.objectNumber}`} />
                                <ModalListItem icon={<HomeIcon size={22} color="#7393B3" />} text={`TÃ¼r: ${openedOrder?.objectNumber?.street + " " + openedOrder?.objectNumber?.location}`} /*info={"Navi Ã¶ffnen"}*/ infoIcon={<MapPinIcon color={"skyblue"} size={15}  />} />
                                <ModalListItem icon={<MapPinIcon size={22} color="#7393B3" />} text={`Stockwerk: ${selectedItem.location}`} />
                                <Text className="flex p-2 text-lg text-blue-300">Auftrag</Text>
                                <View className="pr-4">
                                    <ModalListDropdownItem icon={<InformationCircleIcon size={22} color="#7393B3" />} text={`Status: ${getTicketStatusNames(selectedItem.statusId)}`} dropdownItems={getTicketStatusTitles()} selected={getTicketStatusNames(selectedItem.statusId)} onSelect={(e) => {
                                        let id = getTicketStatusId(e);
                                        let messtechnikApi = new MesstechnikAPI(token);
                                        const updateOrderStatus = async () => {
                                            let response = await messtechnikApi.updateOrderStatus(selectedItem.orderId, id);
                                            if (response) {
                                                showNotification(<InformationCircleIcon size={15} color={"green"} />, "Status erfolgreich geÃ¤ndert", "green");
                                            } else {
                                                showNotification(<InformationCircleIcon size={15} color={"red"} />, "Fehler beim Ã„ndern des Status", "red");
                                            }
                                        };
                                        updateOrderStatus();
                                    }} />
                                </View>
                                <ModalListItem icon={<InformationCircleIcon size={22} color="#7393B3" />} text={`Auftrag: ${selectedItem.additionalInformation}`} />
                                <ModalListItem icon={<ClockIcon size={22} color="#7393B3" />} text={`Zeit: ${selectedItem.timeFrom} - ${selectedItem.timeTo}`} />
                            </ScrollView>
                        )}
                        {selectedTab === "GerÃ¤te" && (
                            <ScrollView contentContainerStyle={{ flexGrow: 1, minWidth:"100%" }} style={{ width: "100%", minWidth: "100%" }}>
                                <Text className="flex p-2 text-lg text-blue-300">GerÃ¤te</Text>
                                {devices.map((device, index) => (
                                    <View key={index} className="flex w-full self-start min-w-full">
                                        <ModalListItem icon={<DevicePhoneMobileIcon size={22} color="#7393B3" />} text={`ID: ${device.deviceId}`} />
                                        <ModalListItem text={`Seriennummer: ${device.meterNumber}`} />
                                        <ModalListItem text={`GerÃ¤tenummer: ${device.deviceNumber}`} />
                                        <ModalListItem text={`Raum: ${device.room}`} />
                                        <ModalListItem text={`Hersteller: ${device.devicesInfo.manufacturer}`} />
                                        <ModalListItem text={`Typ: ${device.devicesInfo.type}`} />
                                        <ModalListItem text={`Modulnummer: ${device?.deviceModules?.moduleNumber}`} />
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                      {selectedTab === "Kommentare" && (
    <ScrollView contentContainerStyle={{ flexGrow: 1, width: "100%", minWidth: "100%"}} style={{ width: "100%", minWidth: "100%" }}>
        <View className="flex flex-col w-full">
            <TouchableOpacity className={`flex items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Object" ? "border-b-2 border-blue-500" : ""}`} onPress={() => setSelectedTab("Object")}>
                <EnvelopeIcon size={22} color={selectedTab === "Object" ? "#3B82F6" : "#000"} />
                <Text className={`text-xs text-center ml-2 ${selectedTab === "Object" ? "text-blue-500" : "text-gray-800"}`}>Anlage</Text>
            </TouchableOpacity>
            <View className="min-w-full">
                {comments.object && comments?.object.map((comment, index) => (
                    <Comment key={index} title={comment.title} poster={comment.poster} date={comment.postDate} content={comment.content}/>
                ))}
                <TouchableOpacity className="flex items-center p-2 mx-1 bg-white rounded-lg mt-2 mb-2">
                    <Text className="text-md text-blue-500">Erstellen +</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity className={`flex-1 items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Object" ? "border-b-2 border-blue-500" : ""}`} onPress={() => setSelectedTab("Object")}>
                <EnvelopeIcon size={22} color={selectedTab === "Object" ? "#3B82F6" : "#000"} />
                <Text className={`text-xs text-center ml-2 ${selectedTab === "Object" ? "text-blue-500" : "text-gray-800"}`}>Wohnung</Text>
            </TouchableOpacity>
            <View className="min-w-full">
                {comments.apartment && comments?.apartment.map((comment, index) => (
                    <Comment key={index} title={comment.title} poster={comment.poster} date={comment.postDate} content={comment.content}/>
                ))}
                <TouchableOpacity className="flex items-center p-2 mx-1 bg-white rounded-lg mt-2 mb-2">
                    <Text className="text-md text-blue-500">Erstellen +</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity className={`flex-1 items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Object" ? "border-b-2 border-blue-500" : ""}`} onPress={() => setSelectedTab("Object")}>
                <EnvelopeIcon size={22} color={selectedTab === "Object" ? "#3B82F6" : "#000"} />
                <Text className={`text-xs text-center ml-2 ${selectedTab === "Object" ? "text-blue-500" : "text-gray-800"}`}>GerÃ¤te</Text>
            </TouchableOpacity>
            <View className="min-w-full">
                {comments.device && comments?.device.map((comment, index) => (
                    <Comment key={index} title={comment.title} poster={comment.poster} date={comment.postDate} content={comment.content}/>
                ))}
           
            </View>
        </View>
    </ScrollView>
    
)}
                        
      {selectedTab === "Fotos" && (
        <FotosScreen/>
       )}


                    </View>
                    <TouchableOpacity className="items-center p-2 mx-1 bg-gray-100 rounded-lg" onPress={() => setModalVisible(false)}>
                        <Text className="text-gray-800 text-sm font-bold text-center">SchlieÃŸen</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0EA5E9",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: "#FFF",
    marginLeft: 5,
  },
});

export default CalendarScreen;