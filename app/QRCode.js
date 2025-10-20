import { useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import * as ImagePicker from 'expo-image-picker';
import MesstechnikAPI from "../API/MesstechnikAPI";

function QRCodeScreen() {
   
   
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [barcode, setBarcode] = useState(true);
    //const [image, setImage] = useState(false);
    const [path, setPath] = useState("");
    const token = useSelector((state) => state.auth.token)
    const [image, setImage] = useState(null);



    const handleBarCodeScanned = async ({ type, data }) => {
        
        alert(`Bar code mit dem ${type} und den Daten ${data} wurde eingescannt!`);
        var code = data;
        
        //setImage(true)
        setBarcode(false)

        if (data[0] == 1) {
            setPath("device:" + code.substring(1, 11))
        }
        else if (data[0] == 2) {
            setPath("apartment:" + code.substring(1, 11))
        }
        else if (data[0] == 3) {
            setPath("object:" + code.substring(1, 11))
        } 

        setImage(true)
    }

    const selectFile = async () => {

        
        let apiMesstechnik = new MesstechnikAPI(token)

        let result = await ImagePicker.launchCameraAsync({});
        let formData = new FormData();
        formData.append("file", result)
        formData.append("path", path)

        const imageUpload = apiMesstechnik.upload("upload", formData)

        alert("Das Bild wurde aufgenommen und gespeichert!")
        setBarcode(true)
        setScanned(true);
        setImage(false)
      
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }
    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
});

export default QRCodeScreen