import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from 'react-native-elements';
import { InformationCircleIcon, UserCircleIcon } from 'react-native-heroicons/outline'; // Make sure to install and import the icon library
import { useSelector } from 'react-redux'; // Assuming you are using Redux for state management
import MesstechnikAPI from '../API/MesstechnikAPI'; // Import the API class

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderWidth: 0,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  addPhotoText: {
    color: '#0EA5E9',
    marginTop: 8,
    fontSize: 16,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFF',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0EA5E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
});

const ProfileScreen = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.userId);
  const [showImageNotification, setShowImageNotification] = useState(false);
  const [imageNotificationText, setImageNotificationText] = useState('');
  const [hasImageNotificationError, setHasImageNotificationError] = useState(false);

  useEffect(() => {
    fetchData();
    fetchProfilePhoto();
  }, []);

  const fetchData = async () => {
    if (!token || !userId) {
      console.log('Profil: Missing token or userId');
      return;
    }

    try {
      const apiMesstechnik = new MesstechnikAPI(token);
      const user = await apiMesstechnik.getUserById(userId);

      if (user) {
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
      }
    } catch (error) {
      console.error('Profil: Failed to fetch user data:', error);
    }
  };

  const fetchProfilePhoto = async () => {
    const apiMesstechnik = new MesstechnikAPI(token);
    apiMesstechnik.getProfilePhoto(
      userId,
      (imageSrc) => {
        setProfileImage(imageSrc);
      },
      (error) => {
        console.error('Failed to fetch profile photo:', error);
      }
    );
  };

  const delayAndHideNotification = () => {
    setTimeout(() => { setShowImageNotification(false); }, 3000);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.uri);
      uploadImage(result);
    }
  };

  const uploadImage = async (image) => {
    const apiMesstechnik = new MesstechnikAPI(token);
    const file = {
      uri: image.uri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    };

    apiMesstechnik.uploadProfilePhoto(
      file,
      (response) => {
        console.log('Upload successful:', response);
        setImageNotificationText('Profilbild erfolgreich gespeichert.');
        setShowImageNotification(true);
        delayAndHideNotification();
        setHasImageNotificationError(false);
      },
      (error) => {
        console.error('Upload failed:', error);
        setImageNotificationText('Profilbild konnte nicht gespeichert werden.');
        setShowImageNotification(true);
        delayAndHideNotification();
        setHasImageNotificationError(true);
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage}>
          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <UserCircleIcon size={120} color="#4A4A4A" />
          )}
        </TouchableOpacity>
        <Text style={styles.addPhotoText}>Profilbild hinzufügen</Text>
      </View>

      {showImageNotification && (
        <View style={styles.notificationContainer}>
          <InformationCircleIcon size={20} color={hasImageNotificationError ? "red" : "green"} />
          <Text style={styles.notificationText}>{imageNotificationText}</Text>
        </View>
      )}

      <Card containerStyle={styles.cardContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Vorname</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Nachname</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>E-Mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Speichern</Text >
        </TouchableOpacity>
      </Card>
    </ScrollView>
  );
};

export default ProfileScreen;