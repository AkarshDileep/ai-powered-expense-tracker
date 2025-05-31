import React, { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";



const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
 const [password, setPassword] = useState("");
 const handleLogin = () => {
  Alert.alert("Login Attempt", `Email: ${email}\nPassword: ${password}`);
 };
  const API_URL = 'https://expense-tracker-3-uoa5.onrender.com/users/login'
  const loginn = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
  
      const data = await response.json();
      console.log('Login response:', data);
  
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        Alert.alert("Success", "Successfully logged in");
        navigation.navigate("Home");
      } else {
        Alert.alert("Login Failed", data.error || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong");
    }
  };  
 return (

  <View style={styles.container}>

   <View style={styles.loginContainer}>

    <Text style={styles.title}>RISEUP</Text>

    <View style={styles.inputGroup}>

    <Text style={styles.label}>Username</Text>

    <TextInput

      style={styles.input}

      placeholder="Enter your username"

      value={username}

      onChangeText={setUsername}
      
    />
    </View>

    <View style={styles.inputGroup}>

     <Text style={styles.label}>Password</Text>

     <TextInput

      style={styles.input}

      placeholder="Enter your password"

      secureTextEntry

      value={password}

      onChangeText={setPassword}

     />

    </View>

    <TouchableOpacity style={styles.button} onPress={loginn}>

     <Text style={styles.buttonText}>Login</Text>

    </TouchableOpacity>

    <Text style={styles.registerText}>Don't have an account?
    
      <Text  style={styles.registerLink} onPress={() => navigation.navigate("Signup")}>Register</Text>
    </Text>
    

   </View>

  </View>

 );

};



const styles = StyleSheet.create({

 container: {

  flex: 1,

  justifyContent: "center",

  alignItems: "center",

  backgroundColor: "black",

 },

 loginContainer: {

  backgroundColor: "rgba(27, 27, 27, 0.76)",

  padding: 25,

  borderRadius: 20,

  shadowColor: "#000",

  shadowOffset: { width: 0, height: 2 },

  shadowOpacity: 0.2,

  shadowRadius: 4,

  elevation: 5,

  width: 300,

  textAlign: "center",

 },

 title: {

  fontSize: 24,

  
  fontFamily: "serif",
  marginBottom: 20,

  textAlign: "center",

  color: "white",

 },

 inputGroup: {

  marginBottom: 15,

 },

 label: {

  fontSize: 14,
  color: "white",
  fontFamily: "serif",
  marginBottom: 5,

 },

 input: {

  width: "100%",
  color: "white",
  fontFamily: "serif",
  padding: 10,

  borderWidth: 1,

  borderColor: "#ccc",

  borderRadius: 5,

  fontSize: 16,

 },

 button: {

  backgroundColor: "white",

  padding: 12,

  borderRadius: 5,

  alignItems: "center",

  marginTop: 10,

 },

 buttonText: {

  color: "black",

  fontSize: 16,
  fontFamily: "serif",
  fontWeight: "bold",

 },

 registerText: {

  marginTop: 10,

  fontSize: 14,
  color: "white",
  fontFamily: "serif",
  textAlign: "center",

 },

 registerLink: {

  color: "white",
  fontFamily: "serif",
  fontWeight: "bold",

 },

});



export default LoginScreen;