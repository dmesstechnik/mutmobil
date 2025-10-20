import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const CameraButton = () => {
  const [image, setImage] = useState(null); // State to store the image URI

  const openCamera = async () =>  {
    // Request permission to access the camera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
 
    if (status !== 'granted') {
      // Show an alert if permission is denied
      Alert.alert('Error', 'Camera access is required to use this feature.');
      return;
    }

    // Open the camera and capture an image
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Allow only images
      allowsEditing: true, // Enable editing after capturing the image
      quality: 1, // Set the quality of the image (1 = best quality)
    });

    // Check if the capture was successful and store the image URI
    if (!result.cancelled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri); // Set the URI of the captured image
    } else {
      console.log('Image capture was canceled or failed.');
    }
  };

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* Button to open the camera */}
      <TouchableOpacity
        style={{
          borderColor: '#7393B3',
          borderWidth: 2,
          padding: 5,
          borderRadius: 8,
        }}
        onPress={openCamera}
      >
        <Text style={{ color: '#7393B3' }}>camera</Text>
      </TouchableOpacity>

      {/* Display the captured image below the button */}
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: 200, height: 200, marginTop: 20, borderRadius: 10 }}
        />
      )}
    </View>
  );
};

export default CameraButton;
