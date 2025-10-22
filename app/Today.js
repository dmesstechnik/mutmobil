import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Icon } from 'react-native-elements';
import { MapPinIcon } from 'react-native-heroicons/outline';
import { useSelector } from 'react-redux';
import MesstechnikAPI from '../components/API/MesstechnikAPI';
import ApartmentPreview from '../components/menus/ApartmentPreview';
import ObjectInfo from '../components/menus/ObjectPreview';

const Today = () => {
  const [filteredObjectNumbers, setFilteredObjectNumbers] = useState([]);
  const [apartmentsByObject, setApartmentsByObject] = useState({});
  const [selectedObjectNumber, setSelectedObjectNumber] = useState(null);
  const [selectedApartmentNumber, setSelectedApartmentNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingObject, setLoadingObject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredApartments, setFilteredApartments] = useState([]);
  const [todaysOrders, setTodaysOrders] = useState({});
  const scrollViewRef = useRef(null);
  const itemHeights = useRef({});
  const userId = useSelector((state) => state.auth.userId);
  const token = useSelector((state) => state.auth.token);

  const loadAuthData = async () => {
    try {
      setIsLoading(true);
      const apiMesstechnik = new MesstechnikAPI(token);
      const installerCalendarInfo = await apiMesstechnik.getInstallerCalendarInfoToDate(
        userId,
        new Date(),
        new Date()
      );

      if (installerCalendarInfo && Object.keys(installerCalendarInfo).length > 0) {
        setTodaysOrders(installerCalendarInfo);
      } else {
        console.warn('installerCalendarInfo is empty or undefined.');
      }

      const objectNumbers = Object.values(installerCalendarInfo)
        .flat()
        .map((item) => item.objectNumber);

      const uniqueObjectNumbers = [...new Set(objectNumbers)];

      const allObjectInfoPromises = uniqueObjectNumbers.map((objectNumber) =>
        apiMesstechnik.getObject(objectNumber)
      );

      const allObjectInfo = await Promise.all(allObjectInfoPromises);
      setFilteredObjectNumbers(allObjectInfo);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const findCurrentObjectAndApartment = () => {
    if (!todaysOrders) {
      console.warn('No data available for search.');
      return null;
    }

    const entries = Object.values(todaysOrders)[0];
    if (!Array.isArray(entries)) {
      console.warn('Order value does not contain expected data.');
      return null;
    }

    const formattedTime = "10:32:22";

    const currentEntry = entries.find(
      (item) => formattedTime >= item.timeFrom && formattedTime <= item.timeTo
    );

    if (!currentEntry) {
      console.warn('No entry matches the current time.');
      return null;
    }

    return {
      objectNumber: currentEntry.objectNumber,
      apartmentNumber: currentEntry.apartmentNumber,
    };
  };

  const handleNowPress = async () => {
    const currentData = findCurrentObjectAndApartment();
    if (currentData) {
      const { objectNumber, apartmentNumber } = currentData;

      try {
        await showApartmentInfoOnPress(objectNumber, apartmentNumber, true);
        setTimeout(() => {
          openApartmentInfo(objectNumber, apartmentNumber);
        }, 1000);
      } catch (error) {
        console.error('Error during handleNowPress:', error);
      }
    } else {
      console.warn('No data found for current time.');
    }
  };

  const showApartmentInfoOnPress = async (objectNumber, apartmentNumber = null, shouldScroll = false) => {
    if (
      selectedObjectNumber === objectNumber &&
      (apartmentNumber === null || apartmentNumber === selectedApartmentNumber)
    ) {
      setSelectedObjectNumber(null);
      setSelectedApartmentNumber(null);
    } else {
      try {
        setIsLoading(true);
        setLoadingObject(objectNumber);

        const apiMesstechnik = new MesstechnikAPI(token);
        const objectApartmentsNumber = await apiMesstechnik.getApartmentsByObjectNumber(objectNumber);

        const mergedApartments = await Promise.all(
          objectApartmentsNumber.map(async (apartmentItem) => {
            const apartmentUser = await apiMesstechnik.getApartmentUser(apartmentItem.id);
            return {
              ...apartmentItem,
              firstName: apartmentUser?.firstName || '',
              lastName: apartmentUser?.lastName || '',
            };
          })
        );

        setApartmentsByObject((prev) => ({
          ...prev,
          [objectNumber]: mergedApartments,
        }));

        setSelectedObjectNumber(objectNumber);

        if (shouldScroll && apartmentNumber) {
          setTimeout(() => {
            scrollToApartment(objectNumber, apartmentNumber);
          }, 500);
        }
      } catch (error) {
        console.error('Error fetching apartment data:', error);
      } finally {
        setIsLoading(false);
        setLoadingObject(null);
      }
    }
  };

  const scrollToApartment = (objectNumber, apartmentNumber) => {
    const apartments = apartmentsByObject[objectNumber];
    if (!apartments || apartments.length === 0) {
      console.warn('Apartments not loaded yet.');
      return;
    }

    if (scrollViewRef.current) {
      const apartmentIndex = apartments.findIndex(
        (apartment) => apartment.apartmentNumber === apartmentNumber
      );

      if (apartmentIndex !== -1) {
        const yOffset = Object.keys(itemHeights.current).slice(0, apartmentIndex).reduce((total, key) => {
          return total + (itemHeights.current[key] || 150);
        }, 0);

        scrollViewRef.current.scrollTo({
          y: yOffset,
          animated: true,
        });
      } else {
        console.warn('Apartment not found in the list.');
      }
    } else {
      console.warn('ScrollView reference is not set.');
    }
  };

  const openApartmentInfo = (objectNumber, apartmentNumber) => {
    setSelectedObjectNumber(objectNumber);
    setSelectedApartmentNumber(apartmentNumber);
  };

  useEffect(() => {
    loadAuthData();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filteredApartments = apartmentsByObject[selectedObjectNumber]?.filter(
      (apartment) =>
        apartment.firstName.toLowerCase().includes(text.toLowerCase()) ||
        apartment.lastName.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredApartments(filteredApartments || []);
  };

  const openGoogleMaps = (street, city, postcode) => {
    const addressParts = [street, postcode, city].filter(Boolean);
    const address = encodeURIComponent(addressParts.join(' '));
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url).catch((err) => console.error('Failed to open Google Maps', err));
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
     {/*    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>Gefilterte Objektnummern:</Text>
        <TouchableOpacity
          onPress={handleNowPress}
          style={{
            borderWidth: 1,
            borderColor: '#0EA5E9',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#0EA5E9', fontWeight: 'bold' }}>Jetzt</Text>
        </TouchableOpacity> */}
      </View>
{/*       <TextInput
        placeholder="Suche nach Vor- und Nachname"
        value={searchQuery}
        onChangeText={handleSearch}
        style={{
          height: 48,
          borderColor: '#E5E7EB',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 16,
          marginBottom: 16,
          backgroundColor: '#FFFFFF',
          fontSize: 16,
        }}
      /> */}
      {filteredObjectNumbers.length > 0 ? (
        <ScrollView
          ref={scrollViewRef}
          onLayout={() => console.log('ScrollView initialized')}
        >
          {filteredObjectNumbers.map((obj, index) => (
            <View
              key={index}
              style={{
                marginBottom: 16,
                padding: 16,
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                borderColor: '#E5E7EB',
                borderWidth: 1,
              }}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                itemHeights.current[index] = height;
              }}
            >
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="home" size={24} color="#0EA5E9" />
                    <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                      Objektnummer: {obj[0].objectNumber}
                    </Text>
                  </View>
                  {isLoading && loadingObject === obj[0].objectNumber && (
                    <ActivityIndicator size="small" color="#0EA5E9" />
                  )}
                </View>
                <ObjectInfo
                  isLoading={isLoading}
                  Addres={obj[0].objSSt}
                  City={obj[0].objSOs}
                  PostNumber={obj[0].objSPl}
                />

                <TouchableOpacity
                  onPress={() => openGoogleMaps(obj[0].objSSt, obj[0].objSOs, obj[0].objSPl)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0EA5E9',
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 12,
                  }}
                >
                  <MapPinIcon size={20} color="white" />
                  <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 8 }}>
                    Navigation öffnen
                  </Text>
                </TouchableOpacity>
              </View>
              {selectedObjectNumber === obj[0].objectNumber &&
                apartmentsByObject[obj[0].objectNumber] && (
                  <>
                    {(searchQuery ? filteredApartments : apartmentsByObject[obj[0].objectNumber]).map(
                      (apr, index) => (
                        apr ? <ApartmentPreview
                          key={index}
                          apartment={apr} 
                          autoTrigger={apr.apartmentNumber === selectedApartmentNumber}
                          workingTime={todaysOrders} 
                        /> : <Text>Not loaded in time</Text>
                      )
                    )}
                  </>
                )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={{ textAlign: 'center', marginTop: 16, fontSize: 16, color: '#6B7280' }}>
          Keine Daten zum Anzeigen.
        </Text>
      )}
    </View>
  );
};

export default Today;