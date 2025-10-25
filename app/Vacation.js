import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CalendarDaysIcon, ClockIcon, PlusIcon } from 'react-native-heroicons/outline';
import { useSelector } from 'react-redux';
import StempelAPI from '../API/StempelAPI';
import SelectableCalendarItem from '../components/menus/SelectableCalendarItem';

const Vacation = () => {
  const [selectedType, setSelectedType] = useState("vacation");
  const [selectedCategory, setSelectedCategory] = useState("neue");
  const [vacationRequests, setVacationRequests] = useState([]);
  const [zaRequests, setZaRequests] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const authToken = useSelector((state) => state.auth.token);
  
  const types = [
    { id: "vacation", label: "Urlaub", icon: CalendarDaysIcon, color: "#0EA5E9" },
    { id: "hoursUsed", label: "Zeitausgleich", icon: ClockIcon, color: "#10B981" }
  ];

  const categories = [
    { id: "neue", label: "Neue" },
    { id: "abgelaufene", label: "Abgelaufene" }
  ];

  useEffect(() => {
    const fetchCompanyRequests = async () => {
      let stempelApi = new StempelAPI(authToken);
      let vacations = await stempelApi.getVacationRequests();
      let za = await stempelApi.getZaRequests();

      setVacationRequests(vacations.data);
      setZaRequests(za.data);
    }
    
    fetchCompanyRequests();
  }, [authToken]);

  const selectedTypeColor = types.find(t => t.id === selectedType)?.color || '#0EA5E9';
  
  const allRequests = selectedType === 'vacation' ? vacationRequests : zaRequests;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const neueRequests = allRequests.filter(request => {
    const deadline = new Date(request.zraumBis);
    deadline.setHours(0, 0, 0, 0);
    return deadline >= today;
  });
  
  const abgelaufeneRequests = allRequests.filter(request => {
    const deadline = new Date(request.zraumBis);
    deadline.setHours(0, 0, 0, 0);
    return deadline < today;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

const handleCreateRequest = async (startDate, endDate) => {
  try {
    const stempelApi = new StempelAPI(authToken);
    const requestData = {
      zraumVon: startDate,
      zraumBis: endDate,
      requestType: selectedType // 'vacation' or 'hoursUsed'
    };
    
    await stempelApi.createCompanyRequest(requestData);
    
    console.log('Request created successfully:', { startDate, endDate, type: selectedType });
    
    // Hide calendar and refresh requests
    setShowCalendar(false);
    
    // Refresh the requests list
    const vacations = await stempelApi.getVacationRequests();
    const za = await stempelApi.getZaRequests();
    setVacationRequests(vacations.data);
    setZaRequests(za.data);
  } catch (error) {
    console.error('Error creating request:', error);
  }
};

  const RequestCard = ({ request }) => (
    <View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-semibold text-gray-800">
          {formatDate(request.zraumVon)} - {formatDate(request.zraumBis)}
        </Text>
        <View 
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: selectedTypeColor + '20' }}
        >
          <Text 
            className="text-xs font-semibold"
            style={{ color: selectedTypeColor }}
          >
            Genehmigt
          </Text>
        </View>
      </View>
      <Text className="text-sm text-gray-600">
        Antragsdatum: {formatDate(request.ansuchDatum)}
      </Text>
      {request.statusChangeDate && (
        <Text className="text-sm text-gray-600 mt-1">
          Status geändert: {formatDate(request.statusChangeDate)}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Type Selection Tabs */}
        <View className="flex-row mb-4">
          {types.map((type, index) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <TouchableOpacity
                key={type.id}
                className={`flex-1 items-center py-3 px-2 rounded-lg ${
                  index !== 0 ? 'ml-2' : ''
                } ${isSelected ? 'bg-white border-2' : 'bg-white'}`}
                style={isSelected ? { borderColor: type.color } : {}}
                onPress={() => setSelectedType(type.id)}
              >
                <Icon size={22} color={isSelected ? type.color : '#9CA3AF'} />
                <Text
                  className={`text-xs font-semibold mt-1 text-center ${
                    isSelected ? '' : 'text-gray-500'
                  }`}
                  style={isSelected ? { color: type.color } : {}}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category Selection */}
        <View className="flex-row mb-4">
          {categories.map((category, index) => {
            const isSelected = selectedCategory === category.id;
            
            return (
              <TouchableOpacity
                key={category.id}
                className={`flex-1 items-center py-2 rounded-lg ${
                  index !== 0 ? 'ml-2' : ''
                } ${isSelected ? 'bg-white border-2' : 'bg-white'}`}
                style={isSelected ? { borderColor: selectedTypeColor } : {}}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isSelected ? '' : 'text-gray-500'
                  }`}
                  style={isSelected ? { color: selectedTypeColor } : {}}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content based on selected category */}
        {selectedCategory === 'neue' ? (
          <View>
            {/* Active Requests */}
            {neueRequests.length > 0 && (
              <View className="mb-4">
                <Text className="text-lg font-bold text-gray-800 mb-3">
                  Aktive Anträge
                </Text>
                {neueRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </View>
            )}

            {/* New Request Button */}
            <TouchableOpacity
              className="bg-white rounded-xl p-4 mb-4 shadow-sm border-2 flex-row items-center justify-center"
              style={{ borderColor: selectedTypeColor }}
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <PlusIcon size={20} color={selectedTypeColor} />
              <Text
                className="text-base font-semibold ml-2"
                style={{ color: selectedTypeColor }}
              >
                Neuen Antrag erstellen
              </Text>
            </TouchableOpacity>
            
            {/* Calendar Component - shown when button is pressed */}
            {showCalendar && (
              <View className="mb-4">
                <SelectableCalendarItem 
                  headerColor={selectedTypeColor} 
                  onSubmit={handleCreateRequest}
                />
              </View>
            )}
          </View>
        ) : (
          <View>
            {abgelaufeneRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
            {abgelaufeneRequests.length === 0 && (
              <View className="bg-white rounded-xl p-8 items-center border border-gray-100">
                <Text className="text-gray-500 text-center text-base">
                  Keine abgelaufenen Einträge vorhanden
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Vacation;