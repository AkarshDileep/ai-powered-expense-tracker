// IntroScreen.js
import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const IntroScreen = ({ navigation }) => {
  useEffect(() => {
    checkAuth();
  }, []);
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setTimeout(() => {
        if (token) {
          navigation.replace('Home'); // Logged in ✅
        } else {
          navigation.replace('Signup'); // Not logged in 🔐
        }
      }, 2500);
    } catch (error) {
      console.error('Error checking auth:', error);
      navigation.replace('Signup');
    }
  };



  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://i.postimg.cc/zfyNDVd5/Whats-App-Image-2025-04-09-at-8-24-54-PM.jpg' }} // put your animation JSON here
        
        style={{ width: 150, height: 150 }}
      />
      {/* <Text style={{color: '#FFFFFF'}}>Rise Up...</Text> */}
    </View>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // dark or themed background
    justifyContent: 'center',
    alignItems: 'center',
  },
});
