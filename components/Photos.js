import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from "react";
import { Alert, Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import MesstechnikAPI from "../API/MesstechnikAPI";
import { SERVER } from "../config/config";

const Photos = ({ objectId, apartmentId }) => {
  const [selectedTab, setSelectedTab] = useState("Object");
  const [uploadCategory, setUploadCategory] = useState("object");
  const [images, setImages] = useState({ object: [], apartment: [], device: [] });
  const [expandedImages, setExpandedImages] = useState({});
  const userId = useSelector((state) => state.auth.userId);
  const token = useSelector((state) => state.auth.token);
  const api = new MesstechnikAPI(token);

  useEffect(() => {
    fetchImages("object", objectId);
    fetchImages("apartment", apartmentId);
  }, []);

  const fetchImages = async (category, id) => {
    try {
      const fetchedImages = await api.getImagesByTargetTypeAndTargetId(category, id);
      setImages((prev) => ({ ...prev, [category]: fetchedImages }));
    } catch (error) {
      console.error(`Error fetching ${category} images:`, error);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === "granted";
    }
    return true;
  };

  const openCamera = async (category) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera access is required to take photos.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.cancelled) {
      const imageUri = result.uri;
      setImages((prev) => ({ ...prev, [category]: [...prev[category], imageUri] }));
      uploadPhoto(imageUri, category);
    }
  };

  const uploadPhoto = async (fileUri, category) => {
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: `${category}.jpg`,
      type: "image/jpeg",
    });

    try {
      let targetId = -1; // Default value in case of an invalid category or missing id
      if (category === "object" && objectId) {
          targetId = objectId; // Use objectId if category is 'object'
      } else if (category === "apartment" && apartmentId) {
          targetId = apartmentId; // Use apartmentId if category is 'apartment'
      }
      
      let url = `${SERVER}/photos/target/${category}/${targetId}`;
      console.log("Uploading photo to:", url);
      await fetch(url, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `${token}`,
        },
      });
    } catch (error) {
      console.error(`Error uploading ${category} photo:`, error);
    }
  };

  const toggleImageSize = (index) => {
    setExpandedImages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleImagePress = (index) => {
    setExpandedImages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, width: "100%" }}>
      <View className="flex flex-col w-full">
        {/* OBJECT */}
        <TouchableOpacity
          className={`flex items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Object" ? "border-b-2 border-blue-500" : ""}`}
          onPress={() => setSelectedTab("Object")}
        >
          <Text className={`text-xs text-center ml-2 ${selectedTab === "Object" ? "text-blue-500" : "text-gray-800"}`}>Anlage</Text>
        </TouchableOpacity>
        <View className="min-w-full">
          <TouchableOpacity onPress={() => openCamera("object")} className="flex items-center p-2 mx-1 bg-white rounded-lg mt-2 mb-2">
            <Text className="text-md text-blue-500">Erstellen +</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {images?.object?.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(index)} // Handle image press
                style={{
                  margin: 5,
                  zIndex: expandedImages[index] ? 10 : 1, // Bring the expanded image to the front
                }}
              >
                <Image
                  source={{ uri }}
                  style={{
                    width: expandedImages[index] ? 300 : 100, // Larger size when expanded
                    height: expandedImages[index] ? 300 : 100, // Larger size when expanded
                    marginBottom: 10,
                    borderRadius: 10,
                    borderColor: "#ccc",
                    borderWidth: 2,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
  
        {/* APARTMENT */}
        <TouchableOpacity
          className={`flex-1 items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Apartment" ? "border-b-2 border-blue-500" : ""}`}
          onPress={() => setSelectedTab("Apartment")}
        >
          <Text className={`text-xs text-center ml-2 ${selectedTab === "Apartment" ? "text-blue-500" : "text-gray-800"}`}>Wohnung</Text>
        </TouchableOpacity>
        <View className="min-w-full">
          <TouchableOpacity onPress={() => openCamera("apartment")} className="flex items-center p-2 mx-1 bg-white rounded-lg mt-2 mb-2">
            <Text className="text-md text-blue-500">Erstellen +</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {images?.apartment?.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(index)} // Handle image press
                style={{
                  margin: 5,
                  zIndex: expandedImages[index] ? 10 : 1, // Bring the expanded image to the front
                }}
              >
                <Image
                  source={{ uri }}
                  style={{
                    width: expandedImages[index] ? 300 : 100, // Larger size when expanded
                    height: expandedImages[index] ? 300 : 100, // Larger size when expanded
                    marginBottom: 10,
                    borderRadius: 10,
                    borderColor: "#ccc",
                    borderWidth: 2,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
  
        {/* DEVICE */}
        <TouchableOpacity
          className={`flex-1 items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Device" ? "border-b-2 border-blue-500" : ""}`}
          onPress={() => setSelectedTab("Device")}
        >
          <Text className={`text-xs text-center ml-2 ${selectedTab === "Device" ? "text-blue-500" : "text-gray-800"}`}>Geräte</Text>
        </TouchableOpacity>
        <View className="min-w-full">
  {/*         <TouchableOpacity onPress={() => openCamera("device")} className="flex items-center p-2 mx-1 bg-white rounded-lg mt-2 mb-2">
            <Text className="text-md text-blue-500">Erstellen +</Text>
          </TouchableOpacity> */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {images?.device?.map((uri, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImagePress(index)} // Handle image press
                style={{
                  margin: 5,
                  zIndex: expandedImages[index] ? 10 : 1, // Bring the expanded image to the front
                }}
              >
                <Image
                  source={{ uri }}
                  style={{
                    width: expandedImages[index] ? 300 : 100, // Larger size when expanded
                    height: expandedImages[index] ? 300 : 100, // Larger size when expanded
                    marginBottom: 10,
                    borderRadius: 10,
                    borderColor: "#ccc",
                    borderWidth: 2,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );  
};

export default Photos;