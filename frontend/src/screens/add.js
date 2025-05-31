import React, { useState } from 'react';
import { View, Text, Button, ScrollView,Image, TouchableOpacity, Alert, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
const AddExp = ({ navigation }) => {
 const [category, setCategory] = useState("");
  const [expens, setExpense] = useState("");
  const [title, setTitle] = useState("");
  const handleLogin = () => {
  };
  const API_URL = 'https://expense-tracker-3-uoa5.onrender.com/expense';// Replace with your actual API URL
  const addExp = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      console.log("Token:", token);
  
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          Item: category,
          expense: expens,
          Title: title,
        }),
      });
  
      const data = await response.json();
      console.log("Backend response:", data);
  
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
  
      Alert.alert("Success", "Expense added successfully");
    } catch (error) {
      console.error("Error adding expense:", error);
      Alert.alert("Error", "Failed to add expense");
    }
  }
  
  return (
 
   <View style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.naver} onPress={() => navigation.navigate("Profile")} >
        <Image
          source={{ uri: 'https://i.postimg.cc/x1hsVChW/Bulb.png' }}
          style={{ width: 50, height: 50 }}
        />
        </TouchableOpacity>
        <TouchableOpacity style={styles.naver} onPress={() => navigation.navigate("Wallet")} >
        <Image
          source={{ uri: 'https://i.postimg.cc/KYT0Gby4/Wallet.png' }}
          style={{ width: 50, height: 50 }}
        />
        </TouchableOpacity>
        <TouchableOpacity style={styles.naver} onPress={() => navigation.navigate("Home")} >
        <Image
          source={{ uri: 'https://i.postimg.cc/j2tg3Fm2/Home-icon.png' }}
          style={{ width: 50, height: 50,alignContent:'center',alignItems:'center'}}
        />

        </TouchableOpacity>
        <TouchableOpacity style={styles.naver} onPress={() => navigation.navigate("AddExp")} >
        <Image
          source={{ uri: 'https://i.postimg.cc/zvz7FRHR/Plus-icon.png' }}
          style={{ width: 50, height: 50,alignContent:'center',alignItems:'center' }}
        />
        </TouchableOpacity>
      </View>

 
    <View style={styles.loginContainer}>
 
 
     <View style={styles.inputGroup}>
 
      <Text style={styles.label}>title</Text>
 
      <TextInput
 
       style={styles.input}
 
       placeholder="Enter title"
 
       keyboardType="default"
 
       value={title}
 
       onChangeText={setTitle}
 
      />
 
     </View>
     <Text style={styles.label}>category</Text>
 
     <Picker
        selectedValue={category}
        onValueChange={(itemValue) => setCategory(itemValue)}
        style={styles.inputt} // reuse your input style
      >
        <Picker.Item  label="Select Category" value="" />
        <Picker.Item label="Food" value="food" />
        <Picker.Item label="Cloth" value="cloth" />
        <Picker.Item label="Health & Grooming" value="health_grooming" />
        <Picker.Item label="Grocery" value="grocery" />
        <Picker.Item label="Others" value="others" />
      </Picker>

 
     <View style={styles.inputGroup}>
 
      <Text style={styles.label}>Price</Text>
 
      <TextInput
 
       style={styles.input}
 
       placeholder="Enter Expense"
 
       keyboardType="numeric"
 
       value={expens}
 
       onChangeText={setExpense}
 
      />
 
     </View>
 
     <TouchableOpacity style={styles.button} onPress={addExp}>
 
      <Text style={styles.buttonText}>Add</Text>
 
     </TouchableOpacity>
 
 
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
  nav: {
    flexDirection: 'row',
    position: 'absolute',
    top: 750,
    left: 50,
    justifyContent: 'space-around',
    backgroundColor: '#171717',
    borderRadius: 50,
    height: 70,
    marginVertical: 10,
    alignItems: 'center',
    zIndex: 1,
},
naver: {
    width: '20%',
    height: 60,
    backgroundColor: '#444',
    borderRadius: 100,
    zIndex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
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
  inputt: {
    height: 50,
    fontFamily: "serif",
    backgroundColor: 'black',
    borderWidth: 1,
    borderColor: '#ccc',
    color: 'white',
    
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
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
 
 
 

export default AddExp;