import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import IntroScreen from './src/screens/IntroScreen.js';
import Wallet from './src/screens/wallet';
import AddExp from './src/screens/add.js';
const Stack = createStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Intro" screenOptions={{ headerShown: false , ...TransitionPresets.SlideFromRightIOS }}>
      <Stack.Screen name="Intro" component={IntroScreen} options={{ headerShown: false, ...TransitionPresets.FadeFromBottomAndroid, ...TransitionPresets.ModalSlideFromBottomIOS }} />
        <Stack.Screen name="Signup" component={SignupScreen} />    
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{...TransitionPresets.SlideFromLeftIOS}} />
        <Stack.Screen name="Wallet" component={Wallet} />
        <Stack.Screen name="AddExp" component={AddExp} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#020202',
      padding: 10,
  },
});
export default App;
