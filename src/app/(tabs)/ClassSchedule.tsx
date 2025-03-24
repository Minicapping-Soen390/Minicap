import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Image, // Import Image component
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const ClassSchedule = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isSigninInProgress, setIsSigninInProgress] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [slideAnim] = useState(new Animated.Value(-200));

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          closeSlider();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const toggleSlider = (event: any) => {
    if (selectedEvent?.id === event.id) {
      closeSlider();
    } else {
      setSelectedEvent(event);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const closeSlider = () => {
    Animated.timing(slideAnim, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSelectedEvent(null);
    });
  };

  useEffect(() => {
    GoogleSignin.configure({
      scopes: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "openid",
        "profile",
        "email",
      ],
      webClientId:
        "436455800564-o1o1i23h8p1neamojjd2ahfk5tjjecdg.apps.googleusercontent.com",
      iosClientId:
        "436455800564-e8o7pk0ea0vemit5iasgr86n58d3295m.apps.googleusercontent.com",
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const signIn = async () => {
    try {
      setIsSigninInProgress(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setUserInfo(userInfo);
      fetchCalendarEvents();
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the sign-in flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign-in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Play services not available or outdated");
      } else {
        console.error("Something went wrong:", error);
      }
    } finally {
      setIsSigninInProgress(false);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setUserInfo(null);
      setEvents([]);
      await AsyncStorage.removeItem("calendarEvents");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      const tokens = await GoogleSignin.getTokens();
      const accessToken = tokens.accessToken;

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(8, 0, 0, 0);
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 0, 0, 0);

      const response = await axios.get(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
          },
        }
      );

      const allEvents = response.data.items;

      const classEvents = allEvents.filter(
        (event: any) =>
          event.location &&
          (event.location.startsWith("Sir George Williams Campus") ||
            event.location.startsWith("Loyola Campus"))
      );

      const formatDate = (dateTime: string) => {
        if (!dateTime) return "No Time Available";
        const date = new Date(dateTime);
        return date.toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      };

      const eventsData = classEvents.map((event: any) => ({
        id: event.id,
        summary: event.summary || "No Title",
        start: event.start?.dateTime,
        startFormatted: formatDate(event.start?.dateTime),
        end: event.end?.dateTime,
        endFormatted: formatDate(event.end?.dateTime),
        location: event.location || "No Location",
      }));

      setEvents(eventsData);
      await AsyncStorage.setItem("calendarEvents", JSON.stringify(eventsData));
    } catch (error) {
      console.error("Error fetching calendar events:", error);
    }
  };

  const timeToIndex = (time: string) => {
    const date = new Date(time);
    const startHour = 8;
    const totalMinutes = (date.getHours() - startHour) * 60 + date.getMinutes();
    const slotIndex = totalMinutes / 30;
    return slotIndex;
  };

  const getEventColor = (title: string) => {
    const summary = title.toLowerCase();
    if (summary.includes("lec")) return "#FFCC80";   // Light orange
    if (summary.includes("tut")) return "#F8BBD0";   // Light pink
    if (summary.includes("lab")) return "#B39DDB";   // Light purple
    return "#CFD8DC"; // Default gray if type is unknown
  };  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Class Schedule</Text>

      {!userInfo ? (
        <GoogleSigninButton
          testID="google-signin-button"
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signIn}
          disabled={isSigninInProgress}
          style={styles.googleButton}
        />
      ) : (
        <View style={styles.scheduleContainer}>
          <Text style={styles.successText}>✅ Connected to Google Calendar!</Text>
          <Text style={styles.userEmail}>Signed in as: {userInfo.data.user?.email}</Text>
          <Button
            testID="signout-button"
            title="Sign Out"
            onPress={signOut}
          />

          <ScrollView style={styles.scrollView}>
            <View style={styles.scheduleGrid}>
              <View style={styles.timeColumn}>
                {Array.from({ length: 30 }).map((_, index) => {
                  const hour = 8 + Math.floor(index / 2);
                  const minute = index % 2 === 0 ? "00" : "30";
                  const timeLabel = `${hour}:${minute}`;
                  if (hour === 23 && minute === "00") {
                    return (
                      <Text key={index} style={styles.timeLabel}>
                        11:00 PM
                      </Text>
                    );
                  }
                  return (
                    <Text key={index} style={styles.timeLabel}>
                      {timeLabel}
                    </Text>
                  );
                })}
              </View>

              <View style={styles.eventColumn}>
                {events.map((event) => {
                  const topValue = timeToIndex(event.start) * 40;
                  const eventHeight =
                    (timeToIndex(event.end) - timeToIndex(event.start)) * 40;

                  return (
                    <TouchableOpacity
                      key={event.id}
                      activeOpacity={0.8}
                      onPress={() => toggleSlider(event)}
                      style={[
                        styles.eventTile,
                        {
                          top: topValue,
                          height: eventHeight,
                          backgroundColor: getEventColor(event.summary),
                        },
                      ]}                      
                    >
                      <Text style={styles.eventTitle}>{event.summary}</Text>
                      <Text style={styles.eventTime}>
                        {event.startFormatted} - {event.endFormatted}
                      </Text>
                      <Text style={styles.eventLocation}>{event.location}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {selectedEvent && (
            <Animated.View
              style={[
                styles.bottomSlider,
                { transform: [{ translateY: slideAnim }] },
              ]}
              {...panResponder.panHandlers}
            >
              <View>
                {/* "X" Button on the Left */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeSlider}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>

                {/* Icon for the Slider (Simple Line) */}
                <View style={styles.sliderIcon} />

                {/* Event Details */}
                <Text style={styles.sliderTitle}>{selectedEvent.summary}</Text>
                <Text style={styles.sliderDateTime}>
                  {new Date(selectedEvent.start).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })} • {selectedEvent.startFormatted} - {selectedEvent.endFormatted}
                </Text>
                <Text style={styles.sliderLocation}>{selectedEvent.location}</Text>
                <View style={styles.roomRow}>
                  <Text style={styles.sliderRoom} numberOfLines={2}>
                    {selectedEvent.location.split(" - ").pop()?.trim()}
                  </Text>
                  <Image
                    source={require('assets/images/arrow.png')}
                    style={styles.arrowImageInline}
                  />
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  googleButton: {
    width: 240,
    height: 48,
    marginTop: 16,
  },
  scheduleContainer: {
    width: "100%",
  },
  scrollView: {
    marginTop: 20,
  },
  scheduleGrid: {
    flexDirection: "row",
    position: "relative",
  },
  timeColumn: {
    width: 60,
    alignItems: "flex-end",
    paddingRight: 10,
  },
  timeLabel: {
    height: 40,
    fontSize: 14,
    color: "#888",
    textAlign: "right",
    paddingRight: 10,
  },
  eventColumn: {
    flex: 1,
    position: "relative",
  },
  eventTile: {
    position: "absolute",
    left: 10,
    width: "90%",
    backgroundColor: "#d32f2f",
    padding: 8,
    borderRadius: 5,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  eventTime: {
    fontSize: 12,
    color: "#000",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  eventLocation: {
    fontSize: 12,
    color: "#000",
    fontStyle: "italic",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  successText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginVertical: 10,
  },
  userEmail: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 10,
  },
  bottomSlider: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 400, // Adjust height as needed
    backgroundColor: "white",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 16,
  },
  closeButton: {
    position: "absolute",
    left: 1,
    top: 1,
    backgroundColor: "white", // 👉 Changed to white
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1, // Optional: Add a border to make the circle visible
    borderColor: "#ccc", // Optional: Border color
  },
  closeButtonText: {
    color: "black", // 👉 Changed to black
    fontSize: 16,
    fontWeight: "bold",
  },
  sliderIcon: {
    alignSelf: "center",
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 16,
  },
  sliderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 20, // 👉 Increased to create more space
    marginLeft: 1,
  },
  sliderDateTime: {
    fontSize: 14,
    marginBottom: 4,
    color: "#555",
  },
  sliderLocation: {
    fontSize: 14,
    marginBottom: 16,
    color: "#555",
  },
  roomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "wrap",
  },
  sliderRoom: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    flexShrink: 1,
    flexWrap: "wrap",
    maxWidth: "85%", // prevents overlap
  },
  arrowImageInline: {
    width: 40,
    height: 40,
    marginLeft: 30,
    resizeMode: "contain",
  },  
});

export default ClassSchedule;