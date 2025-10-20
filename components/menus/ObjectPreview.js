import * as React from 'react';
import {Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons'; 
import CameraButton from './CameraButton';
import Icon from 'react-native-vector-icons/FontAwesome';

const ObjectInfo = ({ PostNumber = '', City = '', Addres = '' }) => {
  return (
    <View style={{ marginBottom: 10, padding: 15, backgroundColor: 'white', borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Icon name="map-pin" size={18} color="#7393B3" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 14, color: '#333' }}>
          Postleitzahl: <Text>{PostNumber || 'N/A'} </Text>
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <Icon name="building" size={18} color="#7393B3" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 14, color: '#333' }}>
          Stadt: <Text>{City || 'N/A'}</Text>
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="home" size={18} color="#7393B3" style={{ marginRight: 10 }} />
        <Text style={{ fontSize: 14, color: '#333' }}>
          Adresse: <Text>{Addres || 'N/A'}</Text>
        </Text>
      </View>
    </View>
  );
};


export default ObjectInfo;
