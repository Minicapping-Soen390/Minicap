import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { globalStyles, mainEdges } from "../styles/globalStyles";

// Define types for better type safety
type DayType = "weekday" | "friday";
type TimeOfDay = "morning" | "afternoon" | "all";
type Campus = "loyola" | "sgw";
type DepartureInfo = string | null;

// Type for departure info
interface NextDepartures {
  loyola: DepartureInfo;
  sgw: DepartureInfo;
}

// Type for schedule data structure
interface ShuttleSchedule {
  [key: string]: {
    morning: {
      loyola: string[];
      sgw: string[];
    };
    afternoon: {
      loyola: string[];
      sgw: string[];
    };
    lastBus: {
      loyola: string;
      sgw: string;
    };
  };
}

// Shuttle bus schedule data
const shuttleScheduleData: ShuttleSchedule = {
  weekday: {
    morning: {
      loyola: ["9:15", "9:30", "9:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45", "12:30", "12:45", "13:00"],
      sgw: ["9:30", "9:45", "10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "12:15", "12:30", "12:45", "13:00", "13:15"]
    },
    afternoon: {
      loyola: ["13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "15:45", "16:30", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30*"],
      sgw: ["13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45", "15:00", "15:15", "15:30", "16:00", "16:15", "16:45", "17:00", "17:15", "17:30", "17:45", "18:00", "18:15", "18:30*"]
    },
    lastBus: {
      loyola: "18:30",
      sgw: "18:30"
    }
  },
  friday: {
    morning: {
      loyola: ["9:15", "9:30", "9:45", "10:15", "10:45", "11:00", "11:15", "12:00", "12:15", "12:45", "13:00", "13:15", "13:45", "14:15"],
      sgw: ["9:45", "10:00", "10:15", "10:45", "11:15", "11:30", "12:15", "12:30", "12:45", "13:15", "13:45", "14:00", "14:15", "14:45"]
    },
    afternoon: {
      loyola: ["14:15", "14:30", "14:45", "15:15", "15:30", "15:45", "16:45", "17:15", "17:45", "18:15*"],
      sgw: ["14:45", "15:00", "15:15", "15:45", "16:00", "16:45", "17:15", "17:45", "18:15*"]
    },
    lastBus: {
      loyola: "18:15",
      sgw: "18:15"
    }
  }
};

const ShuttleBus = () => {
  const [loading, setLoading] = useState(true);
  const [dayType, setDayType] = useState<DayType>("weekday");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning");
  const [nextDepartures, setNextDepartures] = useState<NextDepartures>({ loyola: null, sgw: null });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      calculateNextDepartures();
      setLoading(false);
    }, 1000);
  }, []);

  // Calculate next departures based on current time
  const calculateNextDepartures = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes; // Convert to minutes for easier comparison
    
    // Determine day type
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday
    let currentDayType: DayType | null = null;
    
    if (day === 5) {
      currentDayType = "friday";
    } else if (day >= 1 && day <= 4) {
      currentDayType = "weekday";
    }
    
    if (!currentDayType) {
      // No service on weekends
      setNextDepartures({ loyola: "No service on weekends", sgw: "No service on weekends" });
      return;
    }
    
    setDayType(currentDayType);
    
    // Determine time of day
    const isAfternoon = hours >= 13;
    setTimeOfDay(isAfternoon ? "afternoon" : "morning");
    
    // Get schedule for current day and time
    const schedule = shuttleScheduleData[currentDayType];
    
    // Find next departures
    const findNext = (campusTimes: string[]) => {
      for (const time of campusTimes) {
        const [h, m] = time.replace('*', '').split(':').map(Number);
        const departureTime = h * 60 + m;
        
        if (departureTime > currentTime) {
          return time;
        }
      }
      return "No more departures today";
    };
    
    // Combine morning and afternoon schedules for easier processing
    const loyolaTimes = [...schedule.morning.loyola, ...schedule.afternoon.loyola];
    const sgwTimes = [...schedule.morning.sgw, ...schedule.afternoon.sgw];
    
    setNextDepartures({
      loyola: findNext(loyolaTimes),
      sgw: findNext(sgwTimes)
    });
  };

  // Get all schedule times based on selected filters
  const getFilteredSchedule = () => {
    if (timeOfDay === "all") {
      return {
        loyola: [...shuttleScheduleData[dayType].morning.loyola, ...shuttleScheduleData[dayType].afternoon.loyola],
        sgw: [...shuttleScheduleData[dayType].morning.sgw, ...shuttleScheduleData[dayType].afternoon.sgw]
      };
    }
    return {
      loyola: shuttleScheduleData[dayType][timeOfDay].loyola,
      sgw: shuttleScheduleData[dayType][timeOfDay].sgw
    };
  };

  const renderScheduleTable = () => {
    const schedule = getFilteredSchedule();
    
    // Determine the maximum number of rows needed
    const maxRows = Math.max(schedule.loyola.length, schedule.sgw.length);
    
    const rows = [];
    for (let i = 0; i < maxRows; i++) {
      rows.push(
        <View key={i} style={styles.scheduleRow}>
          <View style={[styles.scheduleCell, styles.leftCell]}>
            {i < schedule.loyola.length && (
              <Text style={styles.timeText}>
                {schedule.loyola[i]}
              </Text>
            )}
          </View>
          <View style={[styles.scheduleCell, styles.rightCell]}>
            {i < schedule.sgw.length && (
              <Text style={styles.timeText}>
                {schedule.sgw[i]}
              </Text>
            )}
          </View>
        </View>
      );
    }
    
    return rows;
  };

  // Fix the mainEdges type - assuming it's an array of Edge values from the library
  const safeAreaEdges = mainEdges as Edge[];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={safeAreaEdges}>
        <ActivityIndicator size="large" color="#800000" />
        <Text style={styles.loadingText}>Loading shuttle schedule...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={safeAreaEdges}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Shuttle Bus Schedule</Text>
        <Text style={styles.scheduleNote}>Schedule in effect: Mar. 3 - Apr. 14, 2025</Text>
        <Text style={styles.scheduleNote}>Times are approximate and may vary due to traffic and weather.</Text>
      </View>

      {/* Next departures section */}
      <View style={styles.nextDeparturesContainer}>
        <Text style={styles.sectionTitle}>Next Departures</Text>
        <View style={styles.departureInfoContainer}>
          <View style={styles.departureInfo}>
            <Text style={styles.departureLabel}>Loyola Campus:</Text>
            <Text style={styles.departureTime}>{nextDepartures.loyola}</Text>
          </View>
          <View style={styles.departureInfo}>
            <Text style={styles.departureLabel}>SGW Campus:</Text>
            <Text style={styles.departureTime}>{nextDepartures.sgw}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={calculateNextDepartures}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Day type filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, dayType === "weekday" && styles.filterButtonActive]}
          onPress={() => setDayType("weekday")}
        >
          <Text style={[styles.filterButtonText, dayType === "weekday" && styles.filterButtonTextActive]}>
            Monday - Thursday
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, dayType === "friday" && styles.filterButtonActive]}
          onPress={() => setDayType("friday")}
        >
          <Text style={[styles.filterButtonText, dayType === "friday" && styles.filterButtonTextActive]}>
            Friday
          </Text>
        </TouchableOpacity>
      </View>

      {/* Time of day filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, timeOfDay === "all" && styles.filterButtonActive]}
          onPress={() => setTimeOfDay("all")}
        >
          <Text style={[styles.filterButtonText, timeOfDay === "all" && styles.filterButtonTextActive]}>
            All Day
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeOfDay === "morning" && styles.filterButtonActive]}
          onPress={() => setTimeOfDay("morning")}
        >
          <Text style={[styles.filterButtonText, timeOfDay === "morning" && styles.filterButtonTextActive]}>
            Morning
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, timeOfDay === "afternoon" && styles.filterButtonActive]}
          onPress={() => setTimeOfDay("afternoon")}
        >
          <Text style={[styles.filterButtonText, timeOfDay === "afternoon" && styles.filterButtonTextActive]}>
            Afternoon
          </Text>
        </TouchableOpacity>
      </View>

      {/* Schedule table */}
      <View style={styles.scheduleContainer}>
        <View style={styles.tableHeader}>
          <View style={[styles.headerCell, styles.leftCell]}>
            <Text style={styles.headerCellText}>Loyola departures</Text>
          </View>
          <View style={[styles.headerCell, styles.rightCell]}>
            <Text style={styles.headerCellText}>S.G.W departures</Text>
          </View>
        </View>
        
        <ScrollView style={styles.scheduleScrollView}>
          {renderScheduleTable()}
          
          {/* Last bus note */}
          <View style={styles.lastBusContainer}>
            <Text style={styles.lastBusText}>
              *Last bus/Dernier départ. Loyola {shuttleScheduleData[dayType].lastBus.loyola}
            </Text>
            <Text style={styles.lastBusText}>
              *Last bus/Dernier départ. SGW {shuttleScheduleData[dayType].lastBus.sgw}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#800000",
  },
  headerContainer: {
    padding: 15,
    backgroundColor: "#800000",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  scheduleNote: {
    fontSize: 12,
    color: "#f0f0f0",
    textAlign: "center",
  },
  nextDeparturesContainer: {
    backgroundColor: "white",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#800000",
  },
  departureInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  departureInfo: {
    flex: 1,
  },
  departureLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  departureTime: {
    fontSize: 18,
    color: "#800000",
    fontWeight: "bold",
  },
  refreshButton: {
    backgroundColor: "#FFC107",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row", 
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginHorizontal: 2,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: "#800000",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#333",
  },
  filterButtonTextActive: {
    color: "white",
    fontWeight: "bold",
  },
  scheduleContainer: {
    flex: 1,
    backgroundColor: "white",
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#800000",
  },
  headerCell: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  headerCellText: {
    color: "white",
    fontWeight: "bold",
  },
  leftCell: {
    borderRightWidth: 1,
    borderRightColor: "#ddd",
  },
  rightCell: {
    
  },
  scheduleScrollView: {
    flex: 1,
  },
  scheduleRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  scheduleCell: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    fontSize: 16,
    color: "#333",
  },
  lastBusContainer: {
    padding: 15,
    backgroundColor: "#f8f8f8",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  lastBusText: {
    color: "#800000",
    fontStyle: "italic",
  },
});

export default ShuttleBus;