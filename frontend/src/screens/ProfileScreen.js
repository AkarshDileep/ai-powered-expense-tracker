import React, { useState, useEffect } from "react";
import { View, Text, TextInput,Button, TouchableOpacity,Image,KeyboardAvoidingView,Platform, StyleSheet, Alert, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
const ProfileScreen = ({ navigation }) => {
    const [salary, setsalary] = useState("");
    const [limit, setLimit] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [hidebtn, sethidebtn] = useState(true);
    const [botReply, setBotReply] = useState('');
    const [Summary, setSummary] = useState('');
    const [Me, setMe] = useState('');
    const [message, setMessage] = useState('');
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);
    const [chat, setChat] = useState(false);
    const [lastMessage, setLastMessage] = useState('');
    

    const API_URL = 'https://expense-tracker-3-uoa5.onrender.com/inputs'; // Ensure 'http://' is included url

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
  const showYesterdaysSummary = async () => {
    const savedReply = await AsyncStorage.getItem('dailyChatReply');
    const savedDate = await AsyncStorage.getItem('dailyChatReplyDate');
    const today = new Date().toISOString().split('T')[0];

    if (savedReply && savedDate && savedDate !== today) {
      setBotReply(savedReply);
    }
  };

  const scheduleDailyFetch = async () => {
    const now = new Date();
    const fetchTime = new Date();
    fetchTime.setHours(1, 13, 0, 0);

    if (now > fetchTime) fetchTime.setDate(fetchTime.getDate() + 1);
    const delay = fetchTime.getTime() - now.getTime();

    
  };

  const scheduleDailySummaryNotification = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧾 Daily Summary',
        body: 'Check your AI spending report!',
        sound: 'default',
      },
      trigger: {
        hour: 23,
        minute: 59,
        repeats: true,
      },
    });
async function fetchMe() {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch('https://expense-tracker-3-uoa5.onrender.com/users/me', {
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
        console.error('Failed to fetch chat summary:', err);
    }
}
  };
  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setChat(true);
      const token = await AsyncStorage.getItem('token');
      setLastMessage(message);  // ✅ Store the actual message
    setMessage(''); 
      const response = await fetch('https://expense-tracker-3-uoa5.onrender.com/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      setReply(data.reply || 'No reply received.');
    } catch (err) {
      console.error('Error sending message:', err);
      setReply('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    AsyncStorage.getItem("token").then(t => console.log('Token from storage:', t));
    const fetchChatDaySummary = async () => {
      try {
        const token = await AsyncStorage.getItem('token');

        const response = await fetch('https://expense-tracker-3-uoa5.onrender.com/api/chatday', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setSummary(data.reply || 'No summary received.');
      } catch (err) {
        console.error('Error fetching summary:', err);
        setSummary('Something went wrong while fetching the summary.');
      } finally {
        setLoading(false);
      }
    };

    fetchChatDaySummary();
    
    scheduleDailyFetch();
    const init = async () => {
      await Notifications.requestPermissionsAsync();
      await scheduleDailySummaryNotification();
      await showYesterdaysSummary();
      await scheduleDailyFetch();
    };
  
    init(); // Call the async function
     // 🆕 fetch balance
}, []);


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
      <KeyboardAvoidingView style={styles.chatbox} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View >
                        
                        <TextInput
                            style={styles.inputt}
                            placeholder="ask something..."
                            value={message}
                            keyboardType="default"
                            onChangeText={setMessage}
                        />
                    </View>
      
      <TouchableOpacity style={styles.sendbtn} onPress={handleSend} ><Text style={styles.buttonText}>Send</Text></TouchableOpacity>
      </KeyboardAvoidingView>

         
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
        <View style={styles.sender}><Text style={styles.label}>{Summary}</Text></View>
        
        {chat && (<View><View style={styles.reciever}><Text style={styles.label}>{lastMessage}</Text></View>

        <View style={styles.sender}><Text style={styles.label}>{reply}</Text></View>
        </View>)}
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
 chatbox: {
  width: 350,
  height: 50,
  backgroundColor: "black",
  borderRadius: 20,
  borderWidth: 1,
  borderColor: "white",
  justifyContent: "space-between",
  alignItems: "center",
  flexDirection: 'row',
  top: 700,
  position: "absolute",
  zIndex: 1,
  alignSelf: "center",
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
