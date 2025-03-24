import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ViewStyle,
  ScrollView,
  Alert,
} from "react-native";
import MapView, { Marker, Region, LatLng, Polygon, Polyline } from "react-native-maps";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import * as Location from "expo-location";
import axios from "axios";
import { globalStyles, mainEdges, brandColors } from "../styles/globalStyles";
import { Campus } from "@/models/Campus";
import { OutdoorLocation } from "@/models/Location";
import buildingsData from "@/data/hardcodedBuildings.json";
import { shuttleService, SHUTTLE_STOPS } from '@/services/ShuttleService';

// Safe HTML sanitization function using sanitize-html library
import sanitizeHtml from 'sanitize-html';

const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {} // Remove all attributes
  }).trim();
};
import Constants from 'expo-constants';

// Define outdoor locations
const outdoorLocationSGW: OutdoorLocation = {
  _id: "loc-sgw",
  locationType: "outdoor",
  latitude: 45.4973,
  longitude: -73.5789,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const outdoorLocationLoyola: OutdoorLocation = {
  _id: "loc-loyola",
  locationType: "outdoor",
  latitude: 45.4581,
  longitude: -73.6405,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

//CampusMap Component
interface CampusMapProps {
  campusId: string;
}

// Define campuses
const SGWCampus: Campus = {
  _id: "sgw-uuid",
  name: "SGW Campus",
  outdoorLocation: "loc-sgw",
  buildingIds: [],
};

const LoyolaCampus: Campus = {
  _id: "loyola-uuid",
  name: "Loyola Campus",
  outdoorLocation: "loc-loyola",
  buildingIds: [],
};

const CampusMap: React.FC<CampusMapProps> = ({ campusId }) => {
  const campus = campusId === SGWCampus._id ? SGWCampus : LoyolaCampus;
  const region: Region =
    campus.outdoorLocation === "loc-sgw"
      ? outdoorLocationSGW
      : outdoorLocationLoyola;
  const mapRef = useRef<MapView | null>(null);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [buildingInfo, setBuildingInfo] = useState<{
    name: string;
    address: string;
    openingHours: string;
    latitude: number;
    longitude: number;
    campus: string;
  } | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [newRoute, setNewRoute] = useState<LatLng[] | null>(null);
  const [directions, setDirections] = useState<any[]>([]);
  const [transportMode, setTransportMode] = useState<string>("walking");
  const [activeTab, setActiveTab] = useState<string>("walking");
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [startingAddress, setStartingAddress] = useState<string>("");
  const [showNavigationPopup, setShowNavigationPopup] = useState<boolean>(false);
  const [isFullScreenDirections, setIsFullScreenDirections] = useState<boolean>(false); // New state for full screen directions
  const [isCrossCampusNavigation, setIsCrossCampusNavigation] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    campus: string;
  } | null>(null);
  const [endPoint, setEndPoint] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    campus: string;
  } | null>(null);
  const [isNavigationStarted, setIsNavigationStarted] = useState<boolean>(false);
  const [shuttleLocations, setShuttleLocations] = useState<any[]>([]);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null);
  const [isLoadingShuttles, setIsLoadingShuttles] = useState(false);
  const [shuttleRoute, setShuttleRoute] = useState<LatLng[] | null>(null);
  const [shuttlePolyline, setShuttlePolyline] = useState<LatLng[] | null>(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const foregroundStatus =
          await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus.status !== "granted") {
          setLocationError("Permission to access location was denied");
          return;
        }

        setPermissionGranted(true);
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (err) {
        console.error("Error getting location:", err);
        setLocationError("Error getting location");
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [region]);

  // Function to check if a point is inside a polygon
  const isPointInPolygon = (point: LatLng, polygon: LatLng[]): boolean => {
    let inside = false;
    const x = point.longitude,
      y = point.latitude;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].longitude,
        yi = polygon[i].latitude;
      const xj = polygon[j].longitude,
        yj = polygon[j].latitude;

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }

    return inside;
  };

  const renderBuildings = () => {
    return buildingsData.map((building) => {
      if (!Array.isArray(building.polygonShape)) {
        console.warn(
          `Building ${building._id} does not have a valid polygonShape`
        );
        return null;
      }

      const coordinates: LatLng[] = building.polygonShape
        .map((coords) => {
          if (Array.isArray(coords) && coords.length === 2) {
            const [longitude, latitude] = coords;
            return { latitude, longitude };
          }
          console.warn(`Invalid coordinates for building ${building._id}`);
          return null;
        })
        .filter((coord): coord is LatLng => coord !== null);

      if (coordinates.length === 0) return null;

      const center = coordinates.reduce(
        (acc, curr) => {
          if (curr) {
            acc.latitude += curr.latitude;
            acc.longitude += curr.longitude;
          }
          return acc;
        },
        { latitude: 0, longitude: 0 }
      );

      center.latitude /= coordinates.length;
      center.longitude /= coordinates.length;

      const isInside =
        userLocation && isPointInPolygon(userLocation, coordinates);
      const isSelected = selectedBuildingId === building._id;

      const colorSettings = {
        insideSelected: { fill: brandColors.orangeTransparent, stroke: brandColors.darkGreen },
        inside: { fill: brandColors.darkGreenTransparent, stroke: brandColors.darkGreen },
        selected: { fill: brandColors.orangeTransparent, stroke: brandColors.concordiaRed },
        default: { fill: brandColors.concordiaRedTransparent, stroke: brandColors.concordiaRed },
      };

      const { fill, stroke } =
        isInside && isSelected
          ? colorSettings.insideSelected
          : isInside
            ? colorSettings.inside
            : isSelected
              ? colorSettings.selected
              : colorSettings.default;

      const buildingNameInitials = building.name.substring(0, 2).toUpperCase();

      return (
        <View key={building._id}>
          <Polygon
            coordinates={coordinates}
            strokeColor={stroke}
            strokeWidth={2}
            fillColor={fill}
          />
          <Marker
            coordinate={center}
            onPress={() => {
              if (showNavigationPopup) {
                return;
              }
              setBuildingInfo({
                name: building.name,
                address: building.address,
                openingHours: building.openingHours,
                latitude: center.latitude,
                longitude: center.longitude,
                campus: building.campus,
              });
              setSelectedBuildingId(building._id);
              if (!destinationAddress) {
                setDestinationAddress(building.address);
                setStartingAddress("My Location");

              }
              setShowNavigationPopup(false);
            }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={globalStyles.marker}>
              <View style={globalStyles.buildingButton}>
                <Text style={globalStyles.buildingButtonText}>
                  {buildingNameInitials}
                </Text>
              </View>
            </View>
          </Marker>
        </View>
      );
    });
  };

  const updateUserLocation = async () => {
    try {
      setIsRefreshing(true);
      setLocationError(null);

      if (!permissionGranted) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationError("Location permission required");
          return;
        }
        setPermissionGranted(true);
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setUserLocation(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.error("Error updating location:", error);
      setLocationError("Failed to get current location");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMapPress = () => {
    if (!showNavigationPopup && buildingInfo) {
      setBuildingInfo(null);
      setSelectedBuildingId(null);
    }
  };

  const handleBuildingSelection = (building: any, selectionType: 'start' | 'end') => {
    if (!building || !building.name) {
      console.error('Invalid building data:', building);
      Alert.alert('Error', 'Invalid building data');
      return;
    }

    const buildingInfo = {
      name: building.name,
      address: building.address,
      openingHours: building.openingHours,
      latitude: building.latitude || 0,
      longitude: building.longitude || 0,
      campus: building.campus,
    };

    if (selectionType === 'start') {
      setStartPoint(buildingInfo);
      setBuildingInfo(buildingInfo);
      setSelectedBuildingId(building._id);
    } else {
      // When setting end point, use current location as start if not already set
      if (!startPoint && userLocation) {
        const userLocationInfo = {
          name: "My Location",
          address: "Current Location",
          openingHours: "",
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          campus: building.campus, // We'll determine the campus based on proximity
        };
        setStartPoint(userLocationInfo);
      } else if (!startPoint && !userLocation) {
        // If no start point and no user location, request location permission
        Alert.alert(
          "Location Required",
          "Please enable location services to use your current location as the starting point.",
          [
            {
              text: "Enable Location",
              onPress: async () => {
                await updateUserLocation();
                if (userLocation) {
                  handleBuildingSelection(building, 'end'); // Retry after getting location
                }
              }
            },
            {
              text: "Cancel",
              style: "cancel"
            }
          ]
        );
        return;
      }

      setEndPoint(buildingInfo);
      setBuildingInfo(buildingInfo);
      setSelectedBuildingId(building._id);
    }
  };

  // Watch for changes in startPoint and endPoint
  useEffect(() => {
    if (startPoint && endPoint) {
      const effectiveStartPoint = startPoint || (userLocation ? {
        name: "My Location",
        campus: determineUserCampus(userLocation),
      } : null);

      if (!effectiveStartPoint || !endPoint) {
        console.error('Start or end point is missing');
        Alert.alert('Error', 'Both start and end points are required.');
        return;
      }

      // Check if we should use shuttle service (cross-campus)
      if (effectiveStartPoint.campus !== endPoint.campus) {
        setIsCrossCampusNavigation(true);
        fetchDirections("transit");
      } else {
        setIsCrossCampusNavigation(false);
        fetchDirections("walking");
      }
    }
  }, [startPoint, endPoint]);

  // Helper function to determine which campus the user is closer to
  const determineUserCampus = (location: Region): string => {
    const sgwDistance = Math.sqrt(
      Math.pow(location.latitude - SHUTTLE_STOPS.SGW.latitude, 2) +
      Math.pow(location.longitude - SHUTTLE_STOPS.SGW.longitude, 2)
    );
    const loyolaDistance = Math.sqrt(
      Math.pow(location.latitude - SHUTTLE_STOPS.LOYOLA.latitude, 2) +
      Math.pow(location.longitude - SHUTTLE_STOPS.LOYOLA.longitude, 2)
    );
    const campus = sgwDistance < loyolaDistance ? 'SGW' : 'LOYOLA';
    return campus;
  };

  // Add function to fetch shuttle data
  const fetchShuttleData = async () => {
    try {
      // First get session cookies
      await axios.get('https://shuttle.concordia.ca/concordiabusmap/Map.aspx', {
        headers: {
          Host: 'shuttle.concordia.ca'
        }
      });

      // Then get shuttle positions
      const response = await axios.post(
        'https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject',
        {},
        {
          headers: {
            Host: 'shuttle.concordia.ca',
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      );

      const shuttleData = response.data.d;
      const busPoints = shuttleData.Points.filter((point: any) => point.ID.startsWith('BUS'));

      // Update shuttle locations
      setShuttleLocations(busPoints);

      // Create route from active shuttle positions
      if (busPoints.length > 0) {
        const validBusPoints = busPoints.filter((bus: any) => {
          const lat = parseFloat(bus.Latitude);
          const lng = parseFloat(bus.Longitude);
          // Filter out buses that are too far from the route (might be parked or out of service)
          return lat >= 45.45 && lat <= 45.51 && lng >= -73.65 && lng <= -73.57;
        });

        if (validBusPoints.length > 0) {
          // Sort buses by their position along Sherbrooke street (west to east)
          const sortedBuses = validBusPoints.sort((a: any, b: any) => a.Longitude - b.Longitude);

          // Create route through all active buses
          const routePoints = [
            { latitude: SHUTTLE_STOPS.LOYOLA.latitude, longitude: SHUTTLE_STOPS.LOYOLA.longitude },
            ...sortedBuses.map((bus: any) => ({
              latitude: parseFloat(bus.Latitude),
              longitude: parseFloat(bus.Longitude)
            })),
            { latitude: SHUTTLE_STOPS.SGW.latitude, longitude: SHUTTLE_STOPS.SGW.longitude }
          ];

          setShuttlePolyline(routePoints);
        }
      }
    } catch (error) {
      console.error('Error fetching shuttle data:', error);
    }
  };

  // Update useEffect for shuttle tracking
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const trackShuttles = async () => {
      try {
        setIsLoadingShuttles(true);
        await fetchShuttleData();

        // Only update wait times if we have start and end points
        if (startPoint && endPoint) {
          const nearestShuttle = shuttleService.getClosestShuttle(
            shuttleLocations,
            startPoint.campus === 'SGW' ? SHUTTLE_STOPS.SGW : SHUTTLE_STOPS.LOYOLA
          );

          if (nearestShuttle) {
            const waitTime = shuttleService.estimateWaitingTime(
              nearestShuttle,
              startPoint.campus === 'SGW' ? SHUTTLE_STOPS.SGW : SHUTTLE_STOPS.LOYOLA
            );
            setEstimatedWaitTime(waitTime);
          }
        }
      } catch (error) {
        console.error('Error tracking shuttles:', error);
        // Don't clear existing route/data on error
      } finally {
        setIsLoadingShuttles(false);
      }
    };

    // Start tracking if we're in cross-campus navigation and using transit mode
    if (isCrossCampusNavigation && activeTab === 'transit') {
      trackShuttles(); // Initial fetch
      intervalId = setInterval(trackShuttles, 15000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCrossCampusNavigation, activeTab, startPoint, endPoint]);

  // Update the fetchDirections function to include shuttle stops
  const fetchDirections = async (mode: string) => {
    if (!startPoint || !endPoint) {
      console.error('Start or end point is missing');
      return;
    }

    try {
      if (startPoint.campus !== endPoint.campus && mode === 'transit') {
        console.log('Fetching cross-campus route with shuttle service');

        // Get directions to shuttle stop
        console.log('Fetching route to shuttle stop...');
        const toShuttleStop = await axios.get(
          "https://maps.googleapis.com/maps/api/directions/json",
          {
            params: {
              origin: `${startPoint.latitude},${startPoint.longitude}`,
              destination: `${SHUTTLE_STOPS[startPoint.campus === 'SGW' ? 'SGW' : 'LOYOLA'].latitude},${SHUTTLE_STOPS[startPoint.campus === 'SGW' ? 'SGW' : 'LOYOLA'].longitude}`,
              mode: 'walking',
              key: Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
          }
        ).catch(error => {
          console.error('Error fetching route to shuttle stop:', error.response?.data || error.message);
          throw new Error('Failed to get directions to shuttle stop');
        });

        if (!toShuttleStop.data.routes?.[0]?.legs?.[0]) {
          throw new Error('Invalid route data received for path to shuttle stop');
        }

        // Get the shuttle route between stops
        console.log('Fetching shuttle route between stops...');
        const shuttleRoute = await axios.get(
          "https://maps.googleapis.com/maps/api/directions/json",
          {
            params: {
              origin: `${SHUTTLE_STOPS[startPoint.campus === 'SGW' ? 'SGW' : 'LOYOLA'].latitude},${SHUTTLE_STOPS[startPoint.campus === 'SGW' ? 'SGW' : 'LOYOLA'].longitude}`,
              destination: `${SHUTTLE_STOPS[endPoint.campus === 'SGW' ? 'SGW' : 'LOYOLA'].latitude},${SHUTTLE_STOPS[endPoint.campus === 'SGW' ? 'SGW' : 'LOYOLA'].longitude}`,
              mode: 'driving',
              key: Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
          }
        ).catch(error => {
          console.error('Error fetching shuttle route:', error.response?.data || error.message);
          throw new Error('Failed to get shuttle route');
        });

        if (!shuttleRoute.data.routes?.[0]?.legs?.[0]) {
          throw new Error('Invalid shuttle route data received');
        }

        // Get directions from other shuttle stop to destination
        console.log('Fetching route from shuttle stop to destination...');
        const fromShuttleStop = await axios.get(
          "https://maps.googleapis.com/maps/api/directions/json",
          {
            params: {
              origin: `${SHUTTLE_STOPS[endPoint.campus === 'SGW' ? 'SGW' : 'LOYOLA'].latitude},${SHUTTLE_STOPS[endPoint.campus === 'SGW' ? 'SGW' : 'LOYOLA'].longitude}`,
              destination: `${endPoint.latitude},${endPoint.longitude}`,
              mode: 'walking',
              key: Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
          }
        ).catch(error => {
          console.error('Error fetching route from shuttle stop:', error.response?.data || error.message);
          throw new Error('Failed to get directions from shuttle stop');
        });

        if (!fromShuttleStop.data.routes?.[0]?.legs?.[0]) {
          throw new Error('Invalid route data received for path from shuttle stop');
        }

        // Get next departure information
        console.log('Getting shuttle departure information...');
        const departureInfo = shuttleService.getNextDepartureTime(startPoint.campus === 'SGW' ? 'SGW' : 'LOYOLA');

        // Start tracking shuttles immediately
        console.log('Fetching real-time shuttle positions...');
        await fetchShuttleData();

        // Set initial route from Google Directions API
        console.log('Processing route data...');
        const initialRoute = decodePolyline(shuttleRoute.data.routes[0].overview_polyline.points);
        setShuttlePolyline(initialRoute);
        setNewRoute(null);

        const combinedSteps = [
          ...toShuttleStop.data.routes[0].legs[0].steps.map((step: any) => ({
            instruction: sanitizeHtmlContent(step.html_instructions),
            distance: step.distance.text,
            duration: step.duration.text,
          })),
          {
            instruction: `Walk to ${startPoint.campus} Campus shuttle stop`,
            distance: toShuttleStop.data.routes[0].legs[0].distance.text,
            duration: toShuttleStop.data.routes[0].legs[0].duration.text,
          },
          {
            instruction: `🚌 Take Concordia Shuttle Bus to ${endPoint.campus} Campus`,
            distance: shuttleRoute.data.routes[0].legs[0].distance.text,
            duration: `Next departure: ${departureInfo.departureTime} (${departureInfo.waitTime} min wait)`,
            isShuttle: true,
            departureInfo
          },
          ...fromShuttleStop.data.routes[0].legs[0].steps.map((step: any) => ({
            instruction: sanitizeHtmlContent(step.html_instructions),
            distance: step.distance.text,
            duration: step.duration.text,
          })),
        ];

        setDirections(combinedSteps);
        setIsNavigationStarted(true);
        setBuildingInfo(null);
      } else {
        // For non-shuttle routes, clear shuttle route and show only the regular route
        console.log('Fetching regular route...');
        setShuttlePolyline(null);
        const response = await axios.get(
          "https://maps.googleapis.com/maps/api/directions/json",
          {
            params: {
              origin: `${startPoint.latitude},${startPoint.longitude}`,
              destination: `${endPoint.latitude},${endPoint.longitude}`,
              mode,
              key: Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            },
          }
        ).catch(error => {
          console.error('Error fetching regular route:', error.response?.data || error.message);
          throw new Error('Failed to get directions');
        });

        if (!response.data.routes?.[0]?.legs?.[0]) {
          throw new Error('Invalid route data received');
        }

        const route = response.data.routes[0];

        if (!route.overview_polyline) {
          console.error("No overview_polyline found in the route");
          return;
        }

        const polyline = route.overview_polyline.points;
        const decodedRoute = decodePolyline(polyline);
        setNewRoute(decodedRoute);

        if (!route.legs || route.legs.length === 0 || !route.legs[0].steps) {
          console.error("No valid legs or steps found in the route");
          return;
        }

        const steps = route.legs[0].steps.map((step: any) => ({
          instruction: sanitizeHtmlContent(step.html_instructions),
          distance: step.distance.text,
          duration: step.duration.text,
        }));

        setDirections(steps);
        setIsNavigationStarted(true);
        setBuildingInfo(null);
      }
    } catch (error) {
      console.error('Error in fetchDirections:', error);
      let errorMessage = 'Failed to fetch route details. ';

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          errorMessage += 'API key may be invalid or restricted.';
        } else if (error.response?.status === 429) {
          errorMessage += 'Too many requests. Please try again later.';
        } else if (error.message) {
          errorMessage += error.message;
        }
      } else if (error instanceof Error) {
        errorMessage += error.message;
      }

      Alert.alert(
        "Error",
        errorMessage,
        [
          {
            text: "Retry",
            onPress: () => fetchDirections(mode)
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resetNavigation()
          }
        ]
      );
    }
  };

  const handleNavigationPopup = () => {
    if (buildingInfo) {
      setStartingAddress("My Location");
      setDestinationAddress(buildingInfo.address);
      setShowNavigationPopup(true);
    }
  };

  const handleGoToBuilding = () => {
    handleNavigationPopup();
    fetchDirections("walking");
  };

  const decodePolyline = (encoded: string) => {
    let index = 0;
    const path = [];
    let latitude = 0;
    let longitude = 0;

    while (index < encoded.length) {
      let byte;
      let shift = 0;
      let result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = ((result & 0x01) ? ~(result >> 1) : result >> 1);
      latitude += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = ((result & 0x01) ? ~(result >> 1) : result >> 1);
      longitude += deltaLng;

      path.push({
        latitude: latitude / 1e5,
        longitude: longitude / 1e5,
      });
      
    }

    return path;
  };

  const handleTransportModeChange = (mode: string) => {
    setTransportMode(mode);
    setActiveTab(mode);
    fetchDirections(mode);
  };

  const resetNavigation = () => {
    setStartPoint(null);
    setEndPoint(null);
    setIsCrossCampusNavigation(false);
    setBuildingInfo(null);
    setSelectedBuildingId(null);
    setNewRoute(null);
    setShuttlePolyline(null);
    setDirections([]);
    setIsNavigationStarted(false);
    setShuttleLocations([]);
  };

  const handleClosePopup = () => {
    setBuildingInfo(null);
    setSelectedBuildingId(null);
    setShowNavigationPopup(false);
    setStartingAddress("");
    setDestinationAddress("");
    setNewRoute(null);
    setDirections([]);
    setIsNavigationStarted(false);
    setShuttleLocations([]);
  };

  return (
    <View style={globalStyles.mapContainer}>
      {locationError ? (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>{locationError}</Text>
        </View>
      ) : null}

      <TouchableWithoutFeedback onPress={handleMapPress} accessible={false}>

        <MapView
          ref={(ref) => (mapRef.current = ref)}
          style={globalStyles.map}
          initialRegion={region}
          pitchEnabled={false}
          rotateEnabled={false}
          zoomEnabled={true}
          zoomControlEnabled={true}
        >

          {permissionGranted && userLocation && (
            <Marker
              coordinate={userLocation}
              title="Your Location"
              pinColor="green"
            />
          )}
          {/* Show either regular route or shuttle route based on mode */}
          {activeTab !== 'transit' ? (
            newRoute && <Polyline coordinates={newRoute} strokeColor="#186DEE" strokeWidth={5} />
          ) : (
            <Polyline
              coordinates={shuttlePolyline || []}
              strokeColor={brandColors.concordiaRed}
              strokeWidth={5}
              lineDashPattern={[10, 5]}
            />
          )}
          {buildingInfo && (
            <Marker
              coordinate={{
                latitude: buildingInfo.latitude,
                longitude: buildingInfo.longitude,
              }}
              title={buildingInfo.name}
              pinColor="orange"
            />
          )}
          {renderBuildings()}
          {/* Add Shuttle Stop Markers */}
          <Marker
            coordinate={{
              latitude: SHUTTLE_STOPS.SGW.latitude,
              longitude: SHUTTLE_STOPS.SGW.longitude,
            }}
            title={SHUTTLE_STOPS.SGW.name}
            description="Concordia Shuttle Stop"
          >
            <View style={[globalStyles.shuttleStopMarker, {
              backgroundColor: brandColors.white,
              padding: 15,
              borderRadius: 30,
              borderWidth: 3,
              borderColor: brandColors.concordiaRed,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }]}>
              <Text style={[globalStyles.shuttleStopText, { fontSize: 32 }]}>🚌</Text>
              <Text style={[globalStyles.shuttleStopText, { fontSize: 16, fontWeight: 'bold', color: brandColors.concordiaRed }]}>SGW</Text>
            </View>
          </Marker>
          <Marker
            coordinate={{
              latitude: SHUTTLE_STOPS.LOYOLA.latitude,
              longitude: SHUTTLE_STOPS.LOYOLA.longitude,
            }}
            title={SHUTTLE_STOPS.LOYOLA.name}
            description="Concordia Shuttle Stop"
          >
            <View style={[globalStyles.shuttleStopMarker, {
              backgroundColor: brandColors.white,
              padding: 15,
              borderRadius: 30,
              borderWidth: 3,
              borderColor: brandColors.concordiaRed,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
            }]}>
              <Text style={[globalStyles.shuttleStopText, { fontSize: 32 }]}>🚌</Text>
              <Text style={[globalStyles.shuttleStopText, { fontSize: 16, fontWeight: 'bold', color: brandColors.concordiaRed }]}>LOY</Text>
            </View>
          </Marker>
          {/* Show active shuttles */}
          {isCrossCampusNavigation && shuttleLocations.map((shuttle) => (
            <Marker
              key={shuttle.ID}
              coordinate={{
                latitude: shuttle.Latitude,
                longitude: shuttle.Longitude,
              }}
              title={`Shuttle ${shuttle.ID}`}
            >
              <View style={[globalStyles.shuttleStopMarker, {
                backgroundColor: brandColors.concordiaRed,
                padding: 15,
                borderRadius: 30,
                borderWidth: 3,
                borderColor: brandColors.white,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.35,
                shadowRadius: 4.84,
                elevation: 7,
              }]}>
                <Text style={[globalStyles.shuttleStopText, {
                  fontSize: 35,
                  color: brandColors.white
                }]}>🚌</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      </TouchableWithoutFeedback>

      {buildingInfo && !isNavigationStarted && (
        <View style={globalStyles.buildingInfoContainer}>
          {isCrossCampusNavigation && startPoint && endPoint ? (
            <>
              <Text style={globalStyles.buildingNameText}>
                Cross-Campus Navigation
              </Text>
              <Text style={globalStyles.addressText}>
                From: {startPoint.name} ({startPoint.campus})
              </Text>
              <Text style={globalStyles.addressText}>
                To: {endPoint.name} ({endPoint.campus})
              </Text>
              <TouchableOpacity
                onPress={() => fetchDirections("transit")}
                style={globalStyles.addButton}
              >
                <Text style={globalStyles.refreshButtonText}>
                  Start Navigation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetNavigation}
                style={[globalStyles.addButton, { marginTop: 10, backgroundColor: "#555" }]}
              >
                <Text style={globalStyles.refreshButtonText}>
                  Reset
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={globalStyles.buildingNameText}>
                {buildingInfo.name}
              </Text>
              <Text style={globalStyles.openingHoursText}>
                {buildingInfo.openingHours}
              </Text>
              <Text style={globalStyles.addressText}>{buildingInfo.address}</Text>
              <View style={globalStyles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => handleBuildingSelection(buildingInfo, 'start')}
                  style={[globalStyles.addButton, { marginRight: 10 }]}
                >
                  <Text style={globalStyles.refreshButtonText}>
                    Set as Start
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleBuildingSelection(buildingInfo, 'end')}
                  style={globalStyles.addButton}
                >
                  <Text style={globalStyles.refreshButtonText}>
                    Set as Destination
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          globalStyles.refreshButton,
          isRefreshing
            ? (globalStyles.refreshButtonDisabled as ViewStyle)
            : {},
        ]}
        onPress={updateUserLocation}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={globalStyles.refreshButtonText}>My Location</Text>
        )}
      </TouchableOpacity>
      {directions.length > 0 && (
        <View style={[globalStyles.directionsContainer, isFullScreenDirections && globalStyles.fullScreenDirections]}>
          <TouchableOpacity onPress={() => {
            setIsFullScreenDirections(!isFullScreenDirections);
          }}>
            <Text style={globalStyles.fullScreenToggleText}>{isFullScreenDirections ? "Exit Full Screen" : "Full Screen"}</Text>
          </TouchableOpacity>

          <View style={globalStyles.directionsHeader}>
            <Text style={globalStyles.directionsTitle}>Directions</Text>
            <TouchableOpacity onPress={resetNavigation} style={globalStyles.cancelButton}>
              <Text style={globalStyles.cancelButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={globalStyles.transportModes}>
            {(isCrossCampusNavigation ? ['shuttle', 'walking', 'driving', 'bicycling'] : ['walking', 'driving', 'transit', 'bicycling']).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => handleTransportModeChange(mode === 'shuttle' ? 'transit' : mode)}
                style={[
                  globalStyles.modeTab,
                  activeTab === (mode === 'shuttle' ? 'transit' : mode) && globalStyles.activeModeTab
                ]}
              >
                <Text style={activeTab === (mode === 'shuttle' ? 'transit' : mode) ? globalStyles.activeModeTabText : globalStyles.modeTabText}>
                  {mode === 'shuttle' ? 'Shuttle Bus' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                  {mode === 'shuttle' && estimatedWaitTime ? ` (${estimatedWaitTime}min wait)` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={globalStyles.directionsScroll}>
            {directions.map((step, index) => (
              <View key={index} style={[
                globalStyles.directionStep,
                step.isShuttle && globalStyles.shuttleDirectionStep
              ]}>
                <Text style={step.isShuttle ? globalStyles.shuttleInstruction : undefined}>
                  {step.instruction}
                </Text>
                <Text>{step.distance} | {step.duration}</Text>
                {step.isShuttle && step.departureInfo && (
                  <View style={globalStyles.shuttleInfo}>
                    <Text style={globalStyles.shuttleScheduleText}>
                      🕒 Next departure: {step.departureInfo.departureTime}
                    </Text>
                    <Text style={globalStyles.shuttleScheduleText}>
                      ⏱️ Estimated wait: {step.departureInfo.waitTime} minutes
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const CampusSwitcher: React.FC = () => {
  const [isSGWCampus, setIsSGWCampus] = useState(true);
  const currentCampusId = isSGWCampus ? SGWCampus._id : LoyolaCampus._id;

  return (
    <SafeAreaView
      style={globalStyles.container}
      edges={mainEdges as readonly Edge[]}
    >
      <View style={globalStyles.switchHeaderContainer}>
        <View style={globalStyles.campusSwitchHeader}>
          <View style={globalStyles.switchContainer}>
            <Text style={globalStyles.switchText}>SGW</Text>
            <Switch
              value={!isSGWCampus}
              onValueChange={() => setIsSGWCampus(!isSGWCampus)}
            />
            <Text style={globalStyles.switchText}>LOY</Text>
          </View>
        </View>
      </View>

      {/* Map Container */}
      <View style={globalStyles.mapContainer}>
        <CampusMap campusId={currentCampusId} />
      </View>
    </SafeAreaView>
  );
};

export default CampusSwitcher;
