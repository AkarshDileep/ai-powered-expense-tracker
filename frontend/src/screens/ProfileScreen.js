import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
const ProfileScreen = ({ navigation }) => {
    const [salary, setsalary] = useState("");
    const [limit, setLimit] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [hidebtn, sethidebtn] = useState(true);
    const [Me, setMe] = useState('');

    const API_URL = 'http://192.168.1.8:3000/inputs'; // Ensure 'http://' is included url

    const handleSubmit = async () => {
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
                    Income: salary,
                    Limit: limit,
                }),
            });

            console.log("Response Status:", response.status); // Log response status

            if (!response.ok) {
                const errorData = await response.json(); // Get error details
                throw new Error(errorData.message || 'Something went wrong');
            }

            const data = await response.json();
            console.log("Backend response:", data);
            Alert.alert("Success", "Expense added successfully");
        } catch (error) {
            console.error("Error adding income:", error);
            Alert.alert("Error", error.message || "Failed to add limit");
        }
    }
    const Show = () => {
      setShowForm(true);
      sethidebtn(false); // Show the form when the button is clicked
  };
async function fetchMe() {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('http://192.168.1.8:3000/users/me', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        });
        
        
        const data = await response.json();
        if (data && data.username) {
          setMe(data.username); // from /users/me route
        } else if (data.user && data.user.username) {
          setMe(data.user.username); // from login/register response
        } // Save response in state
        console.log('Fetched user data:', Me);
    } catch (err) {
        console.error('Failed to fetch user:', err);
    }
}

  useEffect(() => {
    AsyncStorage.getItem("token").then(t => console.log('Token from storage:', t));
    fetchMe();
}, []);


  return (
    
        <View style={styles.container}>
      <View style={styles.nav}>
        <TouchableOpacity style={styles.naver} onPress={() => navigation.navigate("Profile")} >
        <Image
          source={{ uri: 'https://i.postimg.cc/L69dZ3KV/Bulb.png' }}
          style={{ width: 50, height: 50 }}
        />
        </TouchableOpacity>
        <TouchableOpacity style={styles.naver} onPress={() => navigation.navigate("Wallet")} >
        <Image
          source={{ uri: 'https://i.postimg.cc/bwZBQ661/Wallet.png' }}
          style={{ width: 50, height: 50 }}
        />
        </TouchableOpacity>
        <TouchableOpacity style={styles.naver} onPress={() => navigation.navigate("Home")} >
        <Image
          source={{ uri: 'https://i.postimg.cc/wMP21dm1/Home-icon.png' }}
          style={{ width: 50, height: 50,alignContent:'center',alignItems:'center'}}
        />

        </TouchableOpacity>
        <TouchableOpacity style={styles.naver} onPress={() => navigation.navigate("AddExp")} >
        <Image
          source={{ uri: 'https://i.postimg.cc/2jTcgpM4/Plus-icon.png' }}
          style={{ width: 50, height: 50,alignContent:'center',alignItems:'center' }}
        />
        </TouchableOpacity>
      </View>
          <Text style={styles.title}>Hey  </Text>
          {hidebtn && (<TouchableOpacity style={styles.button} onPress={Show}>
                    <Text style={styles.buttonnText }>add spending limit</Text>
                </TouchableOpacity>)}
                {showForm && (<View style={styles.loginContainer}>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Salary</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your salary"
                            value={salary}
                            keyboardType="numeric"
                            onChangeText={setsalary}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Spending Limit</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your spending limit"
                            value={limit}
                            keyboardType="numeric"
                            onChangeText={setLimit}
                        />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                        <Text style={styles.buttonText}>Enter</Text>
                    </TouchableOpacity>
                </View>)}          <View style={styles.managerContainer}>
      <View style={styles.head}>
                <Text style={styles.header}>Manager</Text>
      </View>
      <ScrollView>
        <View style={styles.sender}><Text style={styles.label}>Manage your income and spending limit here.</Text></View>
        <View style={styles.lastpadding}>
                          
                </View>
      </ScrollView>

    </View>
    </View>
  );
};
const styles = StyleSheet.create({

 container: {

  flex: 1,

  
  
  alignItems: "center",

  backgroundColor: "black",

 },
 inputt: {
  position: 'relative',
  color: 'black',
  borderRadius: 20,
  width: 250,
  backgroundColor: "white",
  
  
},
sendbtn: {
  position: 'relative',
  width: 80,
  height: 30,
  alignItems: "center",
  color: 'black',
  backgroundColor: "white",
  borderRadius: 20,
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

 sender:{
    color: "white",
    backgroundColor: "black",
    
    width: 200,
    padding: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
 },
 reciever:{
  color: "white",
  backgroundColor: "black",
  
  width: 200,
  padding: 15,
  borderRadius: 20,
  alignSelf: "flex-end",
},
 managerContainer: {

  backgroundColor: "rgba(27, 27, 27, 0.76)",

  padding: 25,

  borderRadius: 20,

  shadowColor: "#000",

  shadowOffset: { width: 0, height: 2 },

  shadowOpacity: 0.2,

  shadowRadius: 4,

  elevation: 5,
  
  
  width: 380,
  height :500,

  textAlign: "left",
  marginBlockEnd: 30

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

  width: 380,

  textAlign: "left",
  marginBlockEnd: 30

 },
 head: {
  alignItems: 'center',
  marginVertical: 10,
},
lastpadding:{
  height: 150,
 
},
header: {
  fontSize: 18,
  color: '#fff',
  textAlign: 'center',
  fontFamily: 'serif',
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
 buttonnText: {

  color: "black",
  width: 350,
  textAlign: "center",
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



export default ProfileScreen;
