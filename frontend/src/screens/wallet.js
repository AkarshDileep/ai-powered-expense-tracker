import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, View, TouchableOpacity, StyleSheet, Text,Image, Appearance, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'react-native';

const Wallet = ({ navigation }) => {
    const [expenses, setExpenses] = useState([]);
    const [balance, setBalance] = useState(0); // 💰 New state for balance

    const EXPENSE_API_URL = 'https://expense-tracker-3-uoa5.onrender.com/expense';
    const BALANCE_API_URL = 'https://expense-tracker-3-uoa5.onrender.com/balance'; // 🆕 balance endpoint

    const fetchUsers = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(EXPENSE_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await res.json();
            console.log('Fetched expenses:', data);

            if (Array.isArray(data)) {
                setExpenses(data);
                console.log('Expenses:', data);
            } else {
                console.warn('Invalid data format or not authenticated:', data);
                setExpenses([]);
            }

        } catch (err) {
            console.error('Fetch error:', err);
            setExpenses([]);
        }
    };

    const fetchBalance = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            const res = await fetch(BALANCE_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });

            const data = await res.json();
            console.log('Fetched balance:', data);

            if (typeof data === 'number') {
                setBalance(data);
            } else if (data.balance) {
                setBalance(data.balance); // in case it's wrapped in an object
            } else {
                console.warn('Invalid balance format:', data);
            }

        } catch (err) {
            console.error('Balance fetch error:', err);
        }
    };
    // logout.js (or inside any screen like Profile or Settings)


 const handleLogout = async (navigation) => {
  try {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch('https://expense-tracker-3-uoa5.onrender.com/users/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      await AsyncStorage.removeItem('token');
      Alert.alert('Logout', 'You have been logged out successfully!');
      navigation.replace('Intro'); // or 'Login' if you have a login screen
    } else {
      const errData = await response.json();
      Alert.alert('Logout Failed', errData.error || 'Something went wrong.');
    }
  } catch (err) {
    console.error('Logout error:', err);
    Alert.alert('Logout Failed', 'Network error or server issue.');
  }
 };



    useEffect(() => {
        AsyncStorage.getItem("token").then(t => console.log('Token from storage:', t));
        fetchUsers();
        fetchBalance(); // 🆕 fetch balance
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="black" barStyle="light-content" />
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
            <ScrollView style={styles.container}>
                <View style={styles.balance}>
                    <Text style={styles.header}>balance</Text>
                    <Text style={styles.balancetxt}>₹{balance.toFixed(2)}</Text> {/* ✅ updated */}
                    <TouchableOpacity style={styles.button} onPress={() => handleLogout(navigation)}><Text style={styles.buttonText}>Log Out</Text></TouchableOpacity>
                </View>
                <View style={styles.history}>
                    <View style={styles.head}>
                        <Text style={styles.header}>History</Text>
                    </View>
                    <View style={styles.monthly}>
                        {Array.isArray(expenses) && expenses.slice().reverse().map((item, index) => (
                            <View key={index} style={styles.balanceBox}>
                                <Text style={styles.text}>{item.Item || 'Unknown'}</Text>
                                <Text style={styles.amount}>₹{item.expense.toFixed(2)}</Text>
                                <Text style={styles.titlee}>{item.Title || 'No Title' }</Text>
                                <Text style={styles.titlee}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown Date'}</Text>
                            </View>
                        ))}
                    </View>
                </View>
                <View style={styles.lastpadding}>
                                  
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#020202',
        height: '100%',
    },
    header: {
        fontSize: 20,
        color: '#fff',
        left: 10,
        fontFamily: 'serif',
        top: 10,
        opacity: 0.8,
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
    balance: {
        height: 150,
        width: 380,
        top: 70,
        left: 15,
        
        borderColor: 'gold',
        backgroundColor: '#171717',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        alignItems: 'left',
    },
    balancetxt: {
        fontSize: 40,
        fontWeight: 100,
        color: 'white',
        left: 20,
        top: 20,
    },
    button: {

        backgroundColor: "white",
      
        padding: 12,
      
        borderRadius: 5,
        
        width: 100,
        left: 250,
        
        marginTop: 10,
      
       },
      
       buttonText: {
      
        color: "black",
      
        fontSize: 16,
        fontFamily: "serif",
        fontWeight: "bold",
      
       },
      
      
    monthly: {
        borderRadius: 20,
        padding: 15,
        marginBlockEnd: -35,
    },
    balanceBox: {
        backgroundColor: '#171717',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        alignItems: 'left',
    },
    amount: {
        fontSize: 25,
        color: '#fff',
        fontWeight: 100,
        fontFamily: 'serif',
    },
    text: {
        fontSize: 14,
        color: '#585858',
        fontFamily: 'serif',
    },
    titlee: {
        fontSize: 14,
        color: '#585858',
        fontFamily: 'serif',
        textAlign: 'right',
    },
    head: {
        alignItems: 'center',
        marginVertical: 10,
    },
    history: {
        top: 100,
        
    },
    lastpadding:{
        height: 250,
       
      }
});

export default Wallet;
