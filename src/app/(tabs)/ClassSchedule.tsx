import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  TouchableOpacity,
  Animated,
  PanResponder,
  Image,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import globalStyles from "../styles/globalStyles";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { globalStyles, brandColors } from "@/app/styles/globalStyles";
import Constants from 'expo-constants';

const ClassSchedule = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isSigninInProgress, setIsSigninInProgress] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
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
      webClientId: Constants.expoConfig?.extra?.googleWebClientId,
      iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
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
      const eventsData = await fetchCalendarEvents();
      setEvents(eventsData);
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

  const timeToIndex = (time: string) => {
    const date = new Date(time);
    const startHour = 8;
    const totalMinutes = (date.getHours() - startHour) * 60 + date.getMinutes();
    const slotIndex = totalMinutes / 30;
    return slotIndex;
  };

  const getEventColor = (title: string) => {
    const summary = title.toLowerCase();
    if (summary.includes("lec")) return brandColors.orange;    // Use existing orange
    if (summary.includes("tut")) return brandColors.lightPink; // Light pink
    if (summary.includes("lab")) return brandColors.purple;    // Purple
    return brandColors.lightGray; // Default light gray if type is unknown
  };  

  return (
    <SafeAreaView style={globalStyles.container}>
      <Text style={globalStyles.title}>Class Schedule</Text>

      {!userInfo ? (
        <GoogleSigninButton
          testID="google-signin-button"
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signIn}
          disabled={isSigninInProgress}
          style={globalStyles.googleButton}
        />
      ) : (
        <View style={globalStyles.scheduleContainer}>
          <Text style={globalStyles.successText}>✅ Connected to Google Calendar!</Text>
          <Text style={globalStyles.userEmail}>Signed in as: {userInfo.data.user?.email}</Text>
          <Button
            testID="signout-button"
            title="Sign Out"
            onPress={signOut}
          />

          <ScrollView style={globalStyles.scrollView}>
            <View style={globalStyles.scheduleGrid}>
              <View style={globalStyles.timeColumn}>
          <ScrollView style={globalStyles.scrollView}>
            <View style={globalStyles.scheduleGrid}>
              <View style={globalStyles.timeColumn}>
                {Array.from({ length: 30 }).map((_, index) => {
                  const hour = 8 + Math.floor(index / 2);
                  const minute = index % 2 === 0 ? "00" : "30";
                  const timeLabel = `${hour}:${minute}`;
                  if (hour === 23 && minute === "00") {
                    return (
                      <Text key={index} style={globalStyles.timeLabel}>
                        11:00 PM
                      </Text>
                    );
                  }
                  return (
                    <Text key={index} style={globalStyles.timeLabel}>
                      {timeLabel}
                    </Text>
                  );
                })}
              </View>

              <View style={globalStyles.eventColumn}>
              <View style={globalStyles.eventColumn}>
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
                        globalStyles.eventTile,
                        globalStyles.eventTile,
                        {
                          top: topValue,
                          height: eventHeight,
                          backgroundColor: getEventColor(event.summary),
                        },
                      ]}
                    >
                      <Text style={globalStyles.eventTitle}>{event.summary}</Text>
                      <Text style={globalStyles.eventTime}>
                        {event.startFormatted} - {event.endFormatted}
                      </Text>
                      <Text style={globalStyles.eventLocation}>{event.location}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {selectedEvent && (
            <Animated.View
              style={[
                globalStyles.bottomSlider,
                globalStyles.bottomSlider,
                { transform: [{ translateY: slideAnim }] },
              ]}
              {...panResponder.panHandlers}
            >
              <View>
                <TouchableOpacity
                  style={globalStyles.closeButton}
                  style={globalStyles.closeButton}
                  onPress={closeSlider}
                >
                  <Text style={globalStyles.closeButtonText}>X</Text>
                  <Text style={globalStyles.closeButtonText}>X</Text>
                </TouchableOpacity>

                <View style={globalStyles.sliderIcon} />

                <Text style={globalStyles.sliderTitle}>{selectedEvent.summary}</Text>
                <Text style={globalStyles.sliderDateTime}>
                  {new Date(selectedEvent.start).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  • {selectedEvent.startFormatted} -{" "}
                  {selectedEvent.endFormatted}
                </Text>
                <Text style={globalStyles.sliderLocation}>
                  {selectedEvent.location}
                </Text>
                <Text style={globalStyles.sliderLocation}>{selectedEvent.location}</Text>
                <View style={globalStyles.roomRow}>
                  <Text style={globalStyles.sliderRoom} numberOfLines={2}>
                    {selectedEvent.location.split(" - ").pop()?.trim()}
                  </Text>
                  <Image
                    source={require('assets/images/arrow.png')}
                    style={globalStyles.arrowImageInline}
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
    justifyContent: "center",
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
  userInfoContainer: {
    alignItems: "center",
  },
  successText: {
    fontSize: 16,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: "italic",
  },
});

export default ClassSchedule;
