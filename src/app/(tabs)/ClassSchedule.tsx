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
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, Region, LatLng } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import globalStyles from "../styles/globalStyles";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { fetchCalendarEvents } from "../utils/calendarUtils";
import {
  createShuttleFacade,
  renderShuttleMarkers,
} from "../utils/shuttleUtils";
import { createMapFacade } from "../utils/mapUtils";
import buildingsData from "@/data/hardcodedBuildings.json";
import Constants from "expo-constants";

const ClassSchedule = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isSigninInProgress, setIsSigninInProgress] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [slideAnim] = useState(new Animated.Value(-200));

  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [directions, setDirections] = useState<any[]>([]);
  const [shuttlePolyline, setShuttlePolyline] = useState<LatLng[] | null>(null);  

  const shuttleFacade = createShuttleFacade({
    setShuttleLocations: () => {},
    setEstimatedWaitTime: () => {},
    setShuttlePolyline,
  });
  
  const mapFacade = createMapFacade({
    setUserLocation,
    setLocationError: () => {},
    setPermissionGranted: () => {},
    setBuildingInfo: () => {},
    setSelectedBuildingId: () => {},
    setDestinationAddress: () => {},
    setStartingAddress: () => {},
    setStartPoint: () => {},
    setEndPoint: () => {},
    userLocation,
    selectedBuildingId: null,
    Alert,
    destinationAddress: "",
    startPoint: null,
    endPoint: null,
    setShowNavigationPopup: () => {},
    setIsNavigationStarted: () => {},
    setNewRoute: () => {},
    setDirections,
    setShuttlePolyline,
    setTransportMode: () => {},
    setActiveTab: () => {},
    setIsCrossCampusNavigation: () => {},
    shuttleFacade,
  });
  
  const handleNavigateToEvent = async (classEvent: any) => {
    try {
      const userRegion = await mapFacade.getUserLocation();
      if (!userRegion) {
        Alert.alert("Error", "Unable to get your current location.");
        return;
      }
  
      const userPoint = {
        latitude: userRegion.latitude,
        longitude: userRegion.longitude,
        name: "My Location",
        address: "Current Location",
        openingHours: "",
        campus: "auto",
      };
  
      // 🔁 1. Define alias map
      const buildingAlias: Record<string, string> = {
        "hall building": "h building",
        "john molson school of business": "mb building",
        "faubourg building": "fg building",
        "library building": "lb building",
        // Add more if needed
      };

      // 🔁 2. Extract the building name from the location string
      const locationRaw = classEvent.location ?? "";
      const match = locationRaw.match(/-\s*([A-Za-z\s]+?)(?:\s+Rm|\s*$)/i);
      const extractedBuilding = match ? match[1].trim() : "";

      // 🔁 3. Normalize and map to internal name
      const normalized = extractedBuilding.toLowerCase();
      const mappedName = buildingAlias[normalized] ?? extractedBuilding;

      // 🔁 4. Find matching building from dataset
      const matchingBuilding = buildingsData.find((building) =>
        building.name.toLowerCase() === mappedName.toLowerCase()
      );

      if (!matchingBuilding) {
        Alert.alert("Error", `Could not find building: "${mappedName}"`);
        return;
      }

      const coordinates = matchingBuilding.polygonShape
        .map((coords: number[]) => {
          if (Array.isArray(coords) && coords.length === 2) {
            const [lng, lat] = coords;
            return { latitude: lat, longitude: lng };
          }
          return null;
        })
        .filter((c): c is LatLng => c !== null);
  
      if (coordinates.length === 0) {
        Alert.alert("Error", "Invalid building coordinates.");
        return;
      }
  
      const center = coordinates.reduce(
        (acc, curr) => ({
          latitude: acc.latitude + curr.latitude,
          longitude: acc.longitude + curr.longitude,
        }),
        { latitude: 0, longitude: 0 }
      );
  
      center.latitude /= coordinates.length;
      center.longitude /= coordinates.length;
  
      const destinationPoint = {
        latitude: center.latitude,
        longitude: center.longitude,
        name: matchingBuilding.name,
        address: matchingBuilding.address ?? classEvent.location,
        openingHours: matchingBuilding.openingHours ?? "",
        campus: matchingBuilding.campus ?? "SGW",
      };
  
      const isCrossCampus = userPoint.campus !== destinationPoint.campus;
      const transportMode = isCrossCampus ? "transit" : "walking";
  
      const apiKey =
        Constants.expoConfig?.extra?.googleMapsApiKey ??
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
        "";
  
      await mapFacade.fetchDirections(
        transportMode,
        apiKey,
        userPoint,
        destinationPoint
      );
  
      setSelectedEvent(classEvent);
      slideAnim.setValue(0);
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert("Error", "Something went wrong while getting directions.");
    }
  };
  
  
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
    if (summary.includes("lec")) return "#FFCC80"; // Light orange
    if (summary.includes("tut")) return "#F8BBD0"; // Light pink
    if (summary.includes("lab")) return "#B39DDB"; // Light purple
    return "#CFD8DC"; // Default gray if type is unknown
  };

  return (
    <SafeAreaView style={globalStyles.container}>
      <Text
        style={[
          globalStyles.title,
          { marginTop: 6, marginBottom: 10, alignSelf: "center" },
        ]}
      >
        Class Schedule
      </Text>

      {!userInfo ? (
        <GoogleSigninButton
          testID="google-signin-button"
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={signIn}
          disabled={isSigninInProgress}
          style={[globalStyles.googleButton, { alignSelf: "center" }]}
        />
      ) : (
        <View style={globalStyles.scheduleContainer}>
          <Text style={globalStyles.successText}>
            ✅ Connected to Google Calendar!
          </Text>
          <Text style={globalStyles.userEmail}>
            Signed in as: {userInfo.data.user?.email}
          </Text>
          <Button testID="signout-button" title="Sign Out" onPress={signOut} />

          <ScrollView style={globalStyles.scrollView}>
            <View style={globalStyles.scheduleGrid}>
              <View style={globalStyles.timeColumn}>
                {Array.from({ length: 30 }).map((_, index) => {
                  const hour = 8 + Math.floor(index / 2);
                  const minute = index % 2 === 0 ? "00" : "30";
                  const timeLabel = `${hour}:${minute}`;
                  if (hour === 23 && minute === "00") {
                    return (
                      <Text
                        key={`time-${timeLabel}`}
                        style={globalStyles.timeLabel}
                      >
                        11:00 PM
                      </Text>
                    );
                  }
                  return (
                    <Text
                      key={`time-${timeLabel}`}
                      style={globalStyles.timeLabel}
                    >
                      {timeLabel}
                    </Text>
                  );
                })}
              </View>

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
                        {
                          top: topValue,
                          height: eventHeight,
                          backgroundColor: getEventColor(event.summary),
                        },
                      ]}
                    >
                      <Text style={globalStyles.eventTitle}>
                        {event.summary}
                      </Text>
                      <Text style={globalStyles.eventTime}>
                        {event.startFormatted} - {event.endFormatted}
                      </Text>
                      <Text style={globalStyles.eventLocation}>
                        {event.location}
                      </Text>
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
                { transform: [{ translateY: slideAnim }] },
              ]}
              {...panResponder.panHandlers}
            >
              <View>
                {/* "X" Button on the Left */}
                <TouchableOpacity
                  style={globalStyles.closeButton}
                  onPress={closeSlider}
                >
                  <Text style={globalStyles.closeButtonText}>X</Text>
                </TouchableOpacity>

                {/* Icon for the Slider (Simple Line) */}
                <View style={globalStyles.sliderIcon} />

                {/* Event Details */}
                <Text style={globalStyles.sliderTitle}>
                  {selectedEvent.summary}
                </Text>
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
                <View style={globalStyles.roomRow}>
                  <Text style={globalStyles.sliderRoom} numberOfLines={2}>
                    {selectedEvent.location.split(" - ").pop()?.trim()}
                  </Text>
                  <TouchableOpacity onPress={() => handleNavigateToEvent(selectedEvent)}>
                    <Image
                      source={require("assets/images/arrow.png")}
                      style={globalStyles.arrowImageInline}
                      />
                  </TouchableOpacity>
                </View>
                {directions.length > 0 && (
                  <>
                    <Text style={globalStyles.title}>Directions</Text>
                    <ScrollView style={globalStyles.directionsScroll}>
                      {directions.map((step, index) => (
                        <View key={index} style={globalStyles.directionStep}>
                          <Text style={globalStyles.title}>{step.instruction}</Text>
                          <Text style={globalStyles.title}>
                            {step.distance} • {step.duration}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                )}
              </View>
            </Animated.View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default ClassSchedule;