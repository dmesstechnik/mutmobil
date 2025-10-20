import { useNavigation } from "@react-navigation/native";
import { Camera } from "expo-camera";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  QrCodeIcon,
  XMarkIcon
} from "react-native-heroicons/solid";

const QrCodeScanDecision = ({ setIsVisible }) => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width;

  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleNavigation = (screen) => {
    setIsVisible(false);
    navigation.navigate(screen);
  };

  const handleBarCodeScanned = ({ type, data }) => {
    if (!scanned) {
      setScanned(true);
      Alert.alert("QR Code Scanned", `Type: ${type}\nData: ${data}`, [
        { text: "OK", onPress: () => setScanned(false) },
      ]);
    }
  };

  const AlertBox = () => {
    setIsVisible(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.overlay}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.overlay}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.alertBox}>
        <TouchableOpacity style={styles.closeButton} onPress={AlertBox}>
          <XMarkIcon size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Izberite opcijo</Text>

        <View style={styles.content}>
          <View
            style={{ flexDirection: "column", justifyContent: "space-between" }}
          >
            {/* QR Code Scanner Option */}
            <TouchableOpacity
              style={styles.square}
              onPress={() => handleNavigation("GeneralPhoto")}
            >
              <QrCodeIcon style={{ color: "#fff" }} />
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Aus Device Agenda
              </Text>
            </TouchableOpacity>

            {/* Camera Scanner */}
            <View style={[styles.square, { overflow: "hidden" }]}>
              <Camera
                style={{ flex: 1, width: "100%" }}
                type={CameraType.back}
                barCodeScannerSettings={{
                  barCodeTypes: ["qr", "code128"],
                }}
                onBarCodeScanned={handleBarCodeScanned}
              />
              <Text style={{ color: "#fff", fontWeight: "bold", marginTop: 5 }}>
                Mit App
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 30,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    width: "100%",
    height: "100%",
  },
  alertBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    width: "80%",
    height: "80%",
    padding: 20,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  content: {
    alignItems: "center",
    justifyContent: "space-around",
  },
  square: {
    marginRight: 10,
    backgroundColor: "#708090",
    marginTop: 20,
    borderRadius: 12,
    width: 200,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default QrCodeScanDecision;