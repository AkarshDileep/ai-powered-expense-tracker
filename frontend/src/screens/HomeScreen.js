import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView,Image, TouchableOpacity, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ExpenseTracker = ({ navigation }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [balance, setBalance] = useState(0); // ✅ Balance state

  const [todayData, setTodayData] = useState([]);
  const [todaytotal, setTodaytotal] = useState([]);
  const [weekData, setWeekData] = useState({ byCategory: [], overallTotal: 0 });
  const [monthData, setMonthData] = useState({ byCategory: [], overallTotal: 0 });

  const handleDayPress = (index) => {
    setSelectedDay(index);
  };
  

  const fetchBalance = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch('https://expense-tracker-3-uoa5.onrender.com/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (typeof data === 'number') setBalance(data);
      else if (data.balance) setBalance(data.balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const todayRes = await fetch('https://expense-tracker-3-uoa5.onrender.com/range_expense?days=1', { headers });
        
        // Check if the response is okay
        if (!todayRes.ok) {
            const errorData = await todayRes.json();
            throw new Error(errorData.message || 'Failed to fetch today expenses');
        }

        const todayJson = await todayRes.json();
        console.log('Today response:', todayJson.byCategory[0]);

        // Check if byCategory is an array and set state
        if (Array.isArray(todayJson.byCategory)) {
            setTodayData(todayJson.byCategory);
            setTodaytotal(todayJson.overallTotal) // Set state directly
        } else {
            console.warn('Invalid data format or not authenticated:', todayJson.byCategory);
            setTodayData([]); // Reset state if data is invalid
        }

        // Log the first item in todayData
        console.log('Today total:', todaytotal);
        console.log('First item in todayData:', todayData[0]); // Use todayData instead of setTodayData
        const weekRes = await fetch('https://expense-tracker-3-uoa5.onrender.com/range_expense?days=6', { headers });
        const weekJson = await weekRes.json();
        setWeekData(weekJson);

        

        const monthRes = await fetch('https://expense-tracker-3-uoa5.onrender.com/totalexpense', { headers });
        const monthJson = await monthRes.json();
        setMonthData(monthJson);
      } catch (err) {
        console.error('Failed to fetch expense data:', err);
        console.error('Failed to fetch expense data:', err);
        Alert.alert("Error", err.message || "An error occurred while fetching expense data.");
      }
    };

    fetchBalance(); // ✅ Fetch balance too
    fetchExpenses();
  }, []);
  const getShortDayName = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  const getFullDateText = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="black" barStyle="light-content" />

      {/* Navigation */}
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
            {/* Today's Expenses */}
            <View style={styles.head}>
                <Text style={styles.header}>Today</Text>
            </View>
            <View style={styles.today}>
                <View style={styles.row}>
                    <View style={styles.totalBox}>
                      {/* todayData[0]?.total+todayData[1]?.total+todayData[2]?.total+todayData[3]?.total+todayData[4]?.total */}
                        <Text style={styles.totalAmount}>{todayData[0]?.total+todayData[1]?.total+todayData[2]?.total+todayData[3]?.total+todayData[4]?.total }</Text>
                        <Text style={styles.whitetext}>Total</Text>
                    </View>
                    <View style={styles.expenseContainer}>
                        <View style={styles.expenseBox}>
                            <Text style={styles.amount}>₹{todayData[0]?.total}</Text>
                            <Text style={styles.text}>{todayData[0]?._id}</Text>
                        </View>
                        <View style={styles.expenseBox}>
                            <Text style={styles.amount}>₹{todayData[1]?.total}</Text>
                            <Text style={styles.text}>{todayData[1]?._id}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.row}>
                        <View style={styles.Box2}>
                            <Text style={styles.amount}>₹{todayData[2]?.total}</Text>
                            <Text style={styles.text}>{todayData[2]?._id}</Text>
                        </View>
                        <View style={styles.Box2}>
                            <Text style={styles.amount}>₹{todayData[3]?.total}</Text>
                            <Text style={styles.text}>{todayData[3]?._id}</Text>
                        </View>
                </View>
                
                <View style={styles.balanceBox}>
                  <Text style={styles.amount}>₹{todayData[4]?.total}</Text>
                  <Text style={styles.text}>{todayData[4]?._id}</Text>
                </View>
            </View>

          {/* Weekly Overview */}

<View style={styles.head}>
  <Text style={styles.header}>Last 6 Days</Text>
</View>

<View style={styles.week}>
  <View style={styles.weekGraph}>
    {Array.isArray(weekData.byDay) && weekData.byDay.map((dayData, index) => {
      const height = Math.min((dayData.total / 5000) * 200, 200);
      const dayName = getShortDayName(dayData._id);

      return (
        <TouchableOpacity
          key={index}
          onPress={() => handleDayPress(index)}
          style={[styles.day, selectedDay === index && styles.daySelected, { height }]}
        >
          <Text style={styles.dayText}>{dayName}</Text>
        </TouchableOpacity>
      );
    })}
  </View>

  {selectedDay !== null && weekData.byDay[selectedDay] && (
    <View>
      <Text style={styles.amount}>
        {`${getFullDateText(weekData.byDay[selectedDay]._id)}: ₹${weekData.byDay[selectedDay].total}`}
      </Text>
    </View>
  )}
</View>


        {/* This Month */}
        <View style={styles.head}>
          <Text style={styles.header}>This Month</Text>
        </View>
        <View style={styles.monthly}>
          {/* <View style={styles.balanceBox}>
            <Text style={styles.text}>Cash Balance</Text>
            <Text style={styles.amount}>₹{balance.toFixed(2)}</Text>
          </View> */}
          <View style={styles.balanceBox}>
            <Text style={styles.text}>Total Expense</Text>
            <Text style={styles.amount}>₹{monthData.overallTotal}</Text>
          </View>
        </View>

        {/* Savings Section */}
        <View style={styles.today}>
          <View style={styles.row}>
            <View style={styles.expenseContainer}>
              {Array.isArray(monthData.byCategory) &&
                monthData.byCategory.slice(0, 2).map((item, index) => (
                  <View key={index} style={styles.expenseBox}>
                    <Text style={styles.amount}>₹{item.total}</Text>
                    <Text style={styles.text}>{item._id}</Text>
                  </View>
                ))}
            </View>
            <View style={styles.totalBox}>
              <Text style={styles.totalAmount}>
              ₹{balance.toFixed(2)}
              </Text>
              <Text style={styles.whitetext}>You Saved</Text>
            </View>
            
          </View>
          <View style={styles.row}>
          {Array.isArray(monthData.byCategory) &&
                monthData.byCategory.slice(2, 3).map((item, index) => (
                        <View style={styles.Box2}>
                            <Text style={styles.amount}>₹{item.total}</Text>
                            <Text style={styles.text}>{item._id}</Text>
                        </View>
                      ))}
          {Array.isArray(monthData.byCategory) &&
                monthData.byCategory.slice(3,4 ).map((item, index) => (
          
                        <View style={styles.Box2}>
                            <Text style={styles.amount}>₹{item.total}</Text>
                            <Text style={styles.text}>{item._id}</Text>
                        </View>
                      ))}
                </View>
                {Array.isArray(monthData.byCategory) &&
                monthData.byCategory.slice(4, 5).map((item, index) => (
                <View style={styles.balanceBox}>
                  <Text style={styles.amount}>₹{item.total}</Text>
                  <Text style={styles.text}>{item._id}</Text>
                </View>
                ))}
        </View>
        <View style={styles.lastpadding}>
                  
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020202',
        padding: 10,
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
    head: {
        alignItems: 'center',
        marginVertical: 10,
    },
    header: {
        fontSize: 22,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'serif',
    },
    today: {
        
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBlockStart: 5,
    },
    totalBox: {
        backgroundColor: '#fff',
        borderRadius: 100,
        height: 160,
        width: 160,
        justifyContent: 'center',
        alignItems: 'center',
    },
    totalAmount: {
        fontSize: 30,
        fontWeight: 100,
    },
    expenseContainer: {
        flexDirection: 'column',
        width: '50%',
        justifyContent: 'space-between',
        container: 'center',
    },
    expenseBox: {
        backgroundColor: '#444',
        borderRadius: 40,
        padding: 15,
        
        marginBottom: 10,
        alignItems: 'center',
    },
    Box2: {
      backgroundColor: '#444',
      borderRadius: 40,
      padding: 15,
      width: '49%',
      marginBottom: 10,
      alignItems: 'center',
  },
    amount: {
        fontSize: 25,
        color: '#fff',
        fontWeight: 100,
        fontFamily: 'serif',
        alignItems: 'center',
        textAlign: 'center',
    },
    text: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'serif',
        alignItems: 'center',
        textAlign: 'center',
    },
    whitetext: {
      fontSize: 14,
      color:'rgba(144, 19, 19, 0.76)',
      fontFamily: 'serif',
  },
    week: {
        backgroundColor: 'rgba(53, 51, 51, 0.76)',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
    },
    weekGraph: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 200,
    },
    day: {
        width: 50,
        backgroundColor: '#f6f4f4',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    daySelected: {
        backgroundColor: 'gold',
    },
    dayText: {
        fontSize: 12,
        fontWeight: 100,
    },
    monthly: {
        
        borderRadius: 20,
        padding: 15,
        marginBlockEnd: -35,
       
    },
    balanceBox: {
        backgroundColor: '#444',
        borderRadius: 40,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
        textAlign: 'center',
    },
    barContainer: {
        alignItems: 'center',
        marginHorizontal: 6,
    },
      
    dayLabel: {
        marginTop: 4,
        fontSize: 12,
        color: '#666',
    },
    lastpadding:{
      height: 80,
     
    }
      
});

export default ExpenseTracker;
