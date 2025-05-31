import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const HomeScreen = () => {
  // State to manage the color and text for each day
  const [clickedDay, setClickedDay] = useState(null);
  const [weekText, setWeekText] = useState('');

  const handleClick = (index) => {
    // Check if the day was already clicked
    if (clickedDay === index) {
      // Reset the color and text
      setClickedDay(null);
      setWeekText('');
    } else {
      // Change the color and update the text
      setClickedDay(index);
      setWeekText(`You clicked Day ${index + 1}`);
    }
  };

  // Day heights (could be dynamic if needed)
  const dayHeights = [100, 180, 150, 140, 120, 170];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Today</Text>
        </View>

        {/* Total Section */}
        <View style={styles.row}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>100</Text>
            <Text style={styles.label}>Total</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.box}>
              <Text style={styles.boxText}>100$</Text>
              <Text style={styles.label}>Food</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020202',
    alignItems: 'center',
    paddingVertical: 20,
  },
  header: {
    marginBottom: 10,
  },
  headerText: {
    color: 'white',
    fontFamily: 'serif',
    fontSize: 18,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  totalContainer: {
    backgroundColor: 'white',
    width: 180,
    height: 180,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 50,
    fontWeight: 100,
  },
  label: {
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
  },
  detailsContainer: {
    flexDirection: 'column',
  },
  box: {
    backgroundColor: 'rgba(27, 27, 27, 0.76)',
    borderRadius: 50,
    width: 180,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  boxText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'serif',
  },
  week: {
    backgroundColor: 'rgba(27, 27, 27, 0.76)',
    borderRadius: 50,
    height: 300,
    paddingTop: 20,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  weekText: {
    color: 'white',
    marginBottom: 20,
    fontSize: 18,
  },
  weekGraph: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#f6f4f4',
  },
  day: {
    width: 50,
    marginLeft: 10,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 5,
  },
  dayText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
});



























import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
 
const HomeScreen = () => {
  const [selectedDay, setSelectedDay] = useState(null);

  return (
    <ScrollView style={ styles.container }>
      
      

      {/* Today's Expense Summary */ }
      <View style={ styles.todaySection }>
        <View style={ styles.circle }>
          <Text style={ styles.circleText }>100</Text>
          <Text style={ styles.circleSubText }>Total</Text>
        </View>
        <View style={ styles.expenseList }>
          { [1, 2, 3, 4].map((item, index) => (
            <TouchableOpacity key={ index } style={ styles.expenseBox }>
              <Text style={ styles.expenseAmount }>100$</Text>
              <Text style={ styles.expenseCategory }>Food</Text>
            </TouchableOpacity>
          )) }
        </View>
      </View>

      {/* Weekly Expense Chart */ }
      <Text style={ styles.weeklyTitle }>This Week</Text>
      <Text style={ styles.clickedText }>
        { selectedDay ? `You clicked Day ${selectedDay}` : "Select a Day" }
      </Text>

      <BarChart
        data={ {
          labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"],
          datasets: [
            {
              data: [50, 90, 130, 100, 80, 60],
            },
          ],
        } }
        width={ Dimensions.get("window").width - 20 }
        height={ 250 }
        yAxisLabel="$"
        chartConfig={ {
          backgroundColor: "#000",
          backgroundGradientFrom: "#000",
          backgroundGradientTo: "#000",
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          barPercentage: 0.6,
          propsForLabels: {
            fontSize: 14,
          },
          propsForBackgroundLines: {
            strokeWidth: 0,
          },
        } }
        style={ styles.chartStyle }
        fromZero
        showValuesOnTopOfBars
        onDataPointClick={ ({ index }) => setSelectedDay(index + 1) } />
    </ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  backArrow: { fontSize: 24, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  todaySection: {
    backgroundColor: "#000",
    padding: 20,
    alignItems: "center",
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: { fontSize: 32, fontWeight: "bold" },
  circleSubText: { fontSize: 16, color: "gray" },
  expenseList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 20,
    justifyContent: "center",
  },
  expenseBox: {
    backgroundColor: "#111",
    width: 120,
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  expenseAmount: { fontSize: 18, color: "#fff", fontWeight: "bold" },
  expenseCategory: { fontSize: 14, color: "gray" },
  weeklyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  clickedText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginVertical: 10,
  },
  chartStyle: {
    marginVertical: 10,
    borderRadius: 15,
    alignSelf: "center",
  },
});
export default HomeScreen;