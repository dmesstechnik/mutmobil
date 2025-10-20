import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { ChartBarIcon, CogIcon, ComputerDesktopIcon, DocumentTextIcon } from 'react-native-heroicons/solid';
import { useSelector } from 'react-redux';
import MesstechnikAPI from '../API/MesstechnikAPI';

const ErrorMessageKategorije = ({ name }) => {
  const [apps, setApps] = useState([]);
  const token = useSelector((state) => state.auth.token);
     const navigation = useNavigation();

  const { width } = useWindowDimensions();

  useEffect(() => {
    doTest();
  }, []);

  const doTest = async () => {
    const apiMesstechnik = new MesstechnikAPI(token);
    let data = await apiMesstechnik.getInhouseApps();
    setApps(data);
  };

  const handlePress = (name) => {
    console.log("navigate");
    navigation.navigate("InhouseApps", { app: name });
};

  const getIcon = (index) => {
    const icons = [
      <ComputerDesktopIcon size={40} color="#0EA5E9" />,
      <DocumentTextIcon size={40} color="#0EA5E9" />,
      <ChartBarIcon size={40} color="#0EA5E9" />,
      <CogIcon size={40} color="#0EA5E9" />,
    ];
    return icons[index % icons.length];
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, paddingVertical: 1, backgroundColor: '#F3F4F6' }}>
      <View style={{
        width: width,
        backgroundColor: 'white',
        padding: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 0,
        alignSelf: 'center',
      }}>
        {apps.map((item, index) => (
          <TouchableOpacity onPress={() => {handlePress(item.name)}} key={item.id} style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 15,
            marginBottom: 10,
            backgroundColor: '#FFFFFF',
            borderRadius: 10,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 2,
          }}>
            {getIcon(index)}
            <Text style={{ marginLeft: 15, fontSize: 18, fontWeight: '500', color: '#4A4A4A' }}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default ErrorMessageKategorije;