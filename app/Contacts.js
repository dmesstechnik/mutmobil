import { MaterialIcons } from '@expo/vector-icons'; // Import Material Icons for user icon
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, Linking, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import MesstechnikAPI from '../API/MesstechnikAPI'; // Adjust import path as needed
import ProfilPhoto from '../components/ProfilePhotoItem';
import photo from '../photo.jpg';
const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadedUsers, setIsLoadedUsers] = useState([]);

  // Hook for navigation
  const navigation = useNavigation();


  // Load contacts on component mount
  useEffect(() => {
    loadItems();
  }, []);
  const userId = useSelector((state) => state.auth.userId);
  const token = useSelector((state) => state.auth.token);
  // Load items using API
  const loadItems = useCallback(async () => {
    try {
      
      

      // Initialize API with the key
      const apiMesstechnik = new MesstechnikAPI(token);

      // Fetch contacts using the API
      const users = await apiMesstechnik.getContacts();

      // Set contacts state with fetched users
      setContacts(users);
      setIsLoadedUsers(users);
      setLoading(false); // Set loading to false once data is fetched

      
    } catch (error) {
      console.error('Error loading items:', error);
      setLoading(false); // Ensure loading is set to false even on error
    }
  }, []);

  // Search functionality
  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  // Handle contact selection
  const handlePress = (contact) => {
    setSelectedContact(contact.id === selectedContact ? null : contact.id);
  };

  // Handle phone press
  const handlePhonePress = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      console.log('Phone number is not available.');
    }
  };

  // Handle email press
  const handleEmailPress = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    } else {
      console.log('Email is not available.');
    }
  };

  // Sort contacts by first name
  const sortedContacts = contacts.sort((a, b) => {
    const nameA = a.firstName.toLowerCase();
    const nameB = b.firstName.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  // Render each contact item
  const renderItem = ({ item }) => {
    if (!item) {
      return null;
    }

    return (
      <View>
        <TouchableOpacity
          onPress={() => handlePress(item)}
          activeOpacity={1}
          style={styles.contactButton}
        >
          <View
            style={[
              styles.contactItem,
              selectedContact === item.id && styles.contactItemSelected,
            ]}
          >
            <ProfilPhoto userId={item.id}/>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.contactPhone}>{item.username}</Text>
            </View>
            <TouchableOpacity onPress={() => item.phoneNumber ? handlePhonePress(item.phoneNumber) : null}style={styles.iconButton}disabled={!item.phoneNumber}>
            <MaterialIcons name="phone"size={30}color={item.phoneNumber ? "#6082B6" : "#B0B0B0"} />
</TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleEmailPress(item.email)}
              style={styles.iconButton}
            >
              <MaterialIcons name="email" size={30} color={item.email  ? "#6082B6" : "#B0B0B0"} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity> 
        {selectedContact === item.id && (
          <View style={styles.contactDetail}>
            <Text style={styles.contactDetailName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.contactDetailPhone}>
              Phone: {item.phoneNumber || 'N/A'}
            </Text>
            <Text style={styles.contactDetailEmail}>
              Settings: {item.settings ? item.settings.join(', ') : 'None'}
            </Text>
            <Text style={styles.contactDetailEmail}>
              Roles: {item.roles ? item.roles.join(', ') : 'None'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Display loading indicator while fetching contacts
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  // Filter contacts based on search query
  const filteredContacts = sortedContacts.filter(
    (contact) =>
      contact.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ImageBackground source={photo} style={styles.backgroundImage}>
      <View style={styles.container}>
        {/* Back Button */}
        {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="black" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity> */}

        {/* Search Input */}
        <TextInput
          placeholder="Kontakte suchen.."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />

        {/* Contacts List */}
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      </View>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,

  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: 'black',
    marginLeft: 5,
    fontSize: 18,
    fontWeight: '400',
  },
  searchInput: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItemSelected: {
    backgroundColor: '#e0f7fa', // Light background color for selected item
  },
  contactIcon: {
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#6082B6',
  },
  contactPhone: {
    fontSize: 15,
    color: '#888',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 5,
  },
  missingIcon: {
    padding: 8,
    color: '#888',
    marginHorizontal: 5,
    fontSize: 12,
  },
  contactDetail: {
    padding: 12,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    marginTop: 4,
    marginLeft: 8,
    marginRight: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  contactDetailName: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 5,
    color: '#6082B6',
  },
  contactDetailPhone: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  contactDetailEmail: {
    fontSize: 16,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f4f7',
  },
});

export default Contacts;