import { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import MapsNotificationItem from '../components/menus/MapsNotificationItem';
import { SERVER } from '../config/config';

const GoogleMapsNavigation = ({ street, location }) => {
  const [streetUseState, setStreet] = useState('');
  const [cityUseState, setCity] = useState('');
  const [postcodeUseState, setPostcode] = useState('');
  const [showMapNotification, setShowMapNotification] = useState(true);

  const userId = useSelector((state) => state.auth.userId);
  const authToken = useSelector((state) => state.auth.token);

  const getTodaysOrders = async () => {
  if (!authToken || !userId) {
    console.warn("âš ï¸ Manjka authToken ali userId â€“ fetch preskoÄen");
    return;
  }

  const today = new Date();
  const formattedDate = today.toISOString().split('T')[0];
  const url = `${SERVER}/order/calendarInfo/${userId}/date?fromDate=${formattedDate}&toDate=${formattedDate}`;
  console.log("ðŸ” PoÅ¡iljam zahtevek na:", url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok (${response.status})`);
    }

    const data = await response.json();
    console.log("âœ… DanaÅ¡nje naloge:", JSON.stringify(data, null, 2));

const todaysOrders = data[formattedDate];

if (Array.isArray(todaysOrders) && todaysOrders.length > 0) {
  // â° Sortiraj po timeFrom
  const sortedOrders = [...todaysOrders].sort((a, b) =>
    a.timeFrom.localeCompare(b.timeFrom)
  );

  const firstOrder = sortedOrders[0];

  console.log("ðŸ“¦ NajzgodnejÅ¡i order danes:", JSON.stringify(firstOrder, null, 2));
  // ðŸ“¡ PoÅ¡lji zahtevek na /objectData/{id} z objectNumber
const objectNumberId = firstOrder.objectNumber;

if (objectNumberId) {
  const objectDataResponse = await fetch(`${SERVER}/objectData/${objectNumberId}`, {
    method: 'GET',
    headers: {
      'Authorization': `${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!objectDataResponse.ok) {
    throw new Error(`âŒ Napaka pri fetchu objectData (${objectDataResponse.status})`);
  }

  const objectData = await objectDataResponse.json();
  console.log("âœ… Prejet objectDataaaaaaaaaaaaaaa:", JSON.stringify(objectData.street, null, 2));

  setStreet(objectData.street)
  setCity(objectData.location)
  setPostcode(objectData.postcode)
}

} else {
  console.log("â„¹ï¸ Ni danaÅ¡njih nalog.");
}

  } catch (error) {
    console.error('âŒ Napaka pri pridobivanju danaÅ¡njih nalog:', error);
  }
};




  // ðŸ” Initial load
useEffect(() => {
  console.log("ðŸ“ street (prop):", street);
  console.log("ðŸ™ï¸ location (prop):", location);
  console.log("ðŸ§¾ userId:", userId);
  console.log("ðŸ” authToken:", authToken);

  if (street) setStreet(street);
  if (location) setCity(location);

  if ((!street || !location) && authToken && userId) {
    getTodaysOrders();
  }

  const currentHour = new Date().getHours();
  setShowMapNotification(currentHour < 20);
}, [street, location, authToken, userId]);


  // ðŸ“ Open Google Maps
  const openGoogleMaps = () => {
    const address = encodeURIComponent(`${streetUseState}, ${postcodeUseState} ${cityUseState}`);
    console.log("ðŸ“¦ Naslov za Google Maps:", `${streetUseState}, ${postcodeUseState} ${cityUseState}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url).catch((err) => console.error('âŒ Failed to open Google Maps', err));
  };

  // ðŸ§­ UI
  return (
    showMapNotification && (
      <View className="justify-center mt-4 border-0  shadow-none">
        <MapsNotificationItem
          name={
            <Text className="mt-2 text-center text-gray-800 text-md broder-2 border-0 shadow-none">
              Wir haben die erste Anlage fÃ¼r dich vorbereitet. MÃ¶chtest du die Navigation zur ersten Anlage Ã¶ffnen?
            </Text>
          }
          onAllow={() => {
            setShowMapNotification(false);
            openGoogleMaps();
          }}
          onDeny={() => setShowMapNotification(false)}
        />
      </View>
    )
  );
};

export default GoogleMapsNavigation;
