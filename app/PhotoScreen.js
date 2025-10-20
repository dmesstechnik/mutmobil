import { useState } from "react";
import { Alert, Image, PermissionsAndroid, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { launchCamera } from "react-native-image-picker";

const FotosScreen = ({ comments }) => {
  const [selectedTab, setSelectedTab] = useState("Object");
  const [images, setImages] = useState({ object: null, apartment: null, device: null });

  // Request Camera Permission (Android only)
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn("Camera permission error:", err);
        return false;
      }
    }
    return true;
  };

  // Open Camera Function
  const openCamera = async (category) => {
    const hasPermission = await requestCameraPermission();


    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera access is required to take photos.");
      return;
    }

    console.log("HasPerm:" + hasPermission);

    launchCamera(
      {
        mediaType: "photo",
        cameraType: "back",
        quality: 1,
      },
      (response) => {
        if (response.didCancel) {
          console.log("User cancelled camera");
        } else if (response.errorMessage) {
          console.error("Camera Error:", response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const imageUri = response.assets[0].uri;
          setImages((prev) => ({ ...prev, [category]: imageUri }));
          uploadPhoto(imageUri, category);
        }
      }
    );
  };

  const uploadPhoto = async (fileUri, category) => {
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: `${category}.jpg `,
      type: "image/jpeg",
    });
    formData.append("userId", "123");

    try {
      const response = await fetch("http://localhost:8080/photo/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.text();
      console.log(`${category} upload response:`, result);
    } catch (error) {
      console.error(`Error uploading ${category} photo:`, error);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, width: "100%" }}>
      <View className="flex flex-col w-full">
        {/* OBJECT */}
        <TouchableOpacity className={`flex items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Object" ? "border-b-2 border-blue-500" : ""}`} onPress={() => setSelectedTab("Object")}>
          <Text className={`text-xs text-center ml-2 ${selectedTab === "Object" ? "text-blue-500" : "text-gray-800"}`}>Object</Text>
        </TouchableOpacity>
        <View className="min-w-full">
          <TouchableOpacity onPress={() => openCamera("object")} className="flex items-center p-2 mx-1 bg-white rounded-lg mt-2 mb-2">
            <Text className="text-md text-blue-500">Erstellen +</Text>
          </TouchableOpacity>
          {images.object && <Image source={{ uri: images.object }} style={{ width: 200, height: 200 }} />}
        </View>

        {/* APARTMENT */}
        <TouchableOpacity className={`flex-1 items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Apartment" ? "border-b-2 border-blue-500" : ""}`} onPress={() => setSelectedTab("Apartment")}>
          <Text className={`text-xs text-center ml-2 ${selectedTab === "Apartment" ? "text-blue-500" : "text-gray-800"}`}>Apartment</Text>
        </TouchableOpacity>
        <View className="min-w-full">
          <TouchableOpacity onPress={() => openCamera("apartment")} className="flex items-center p-2 mx-1 bg-white rounded-lg mt-2 mb-2">
            <Text className="text-md text-blue-500">Erstellen +</Text>
          </TouchableOpacity>
          {images.apartment && <Image source={{ uri: images.apartment }} style={{ width: 200, height: 200 }} />}
        </View>

        {/* DEVICE */}
        <TouchableOpacity className={`flex-1 items-center p-2 mx-1 bg-gray-100 rounded-lg ${selectedTab === "Device" ? "border-b-2 border-blue-500" : ""}`} onPress={() => setSelectedTab("Device")}>
          <Text className={`text-xs text-center ml-2 ${selectedTab === "Device" ? "text-blue-500" : "text-gray-800"}`}>Device</Text>
        </TouchableOpacity>
        <View className="min-w-full">
          <TouchableOpacity onPress={() => openCamera("device")} className="flex items-center p-2 mx-1 bg-white rounded-lg mt-2 mb-2">
            <Text className="text-md text-blue-500">Erstellen +</Text>
          </TouchableOpacity>
          {images.device && <Image source={{ uri: images.device }} style={{ width: 200, height: 200 }} />}
        </View>
      </View>
    </ScrollView>
  );
};

export default FotosScreen;