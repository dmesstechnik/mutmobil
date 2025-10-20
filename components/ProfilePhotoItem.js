import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { UserCircleIcon } from 'react-native-heroicons/outline';
import { useSelector } from 'react-redux';
import MesstechnikAPI from '../API/MesstechnikAPI';

const ProfilPhoto = ({ userId }) => { 
  const token = useSelector((state) => state.auth.token);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (userId) {
      
      fetchProfilePhoto();
    }
  }, [userId]);


  const fetchProfilePhoto = async () => {
    const apiMesstechnik = new MesstechnikAPI(token);

    try {
      apiMesstechnik.getProfilePhotos(
        userId,
        (imageSrc) => {
          
          
          setProfileImage(imageSrc);
        },
        (error) => {
          setProfileImage(null);
        }
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      setProfileImage(null); 
    }
  };

  return (
    <View style={styles.container}>
      {profileImage ? (
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
      ) : (
        <UserCircleIcon size={120} color="#4A4A4A" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50, // Poskrbi zaokrožen izgled
  },
});

export default ProfilPhoto;