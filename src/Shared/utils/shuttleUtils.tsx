import axios from "axios";
import { View, Text } from "react-native";
import { Marker, LatLng, Region } from "react-native-maps";
import { SHUTTLE_STOPS } from "@/MVVM/services/ShuttleService";
import Constants from "expo-constants";



// Create a functional version of the shuttle state instead of using a class with MobX
let shuttleState = {
  locations: [],
  route: null,
  estimatedWaitTime: null,
  isLoading: false,
  error: null
};

/**
 * Determines which campus is closer to the user's current location.
 * @param location - The user's current region coordinates
 * @returns "SGW" if the user is closer to SGW campus, "LOYOLA" otherwise
 */
export const determineUserCampus = (location: Region): string => {
  const sgwDistance = Math.sqrt(
    Math.pow(location.latitude - SHUTTLE_STOPS.SGW.latitude, 2) +
      Math.pow(location.longitude - SHUTTLE_STOPS.SGW.longitude, 2)
  );
  const loyolaDistance = Math.sqrt(
    Math.pow(location.latitude - SHUTTLE_STOPS.LOYOLA.latitude, 2) +
      Math.pow(location.longitude - SHUTTLE_STOPS.LOYOLA.longitude, 2)
  );
  return sgwDistance < loyolaDistance ? "SGW" : "LOYOLA";
};

/**
 * Renders markers for both SGW and Loyola shuttle stops on the map.
 * @param globalStyles - Global styles object containing marker styling
 * @param brandColors - Brand colors object for consistent theming
 * @returns JSX element containing both shuttle stop markers
 */
export const renderShuttleMarkers = (globalStyles: any, brandColors: any) => {
  return (
    <>
      {/* Shuttle Stop Marker for SGW */}
      <Marker
        testID="sgw-campus-shuttle-stop"
        coordinate={{
          latitude: SHUTTLE_STOPS.SGW.latitude,
          longitude: SHUTTLE_STOPS.SGW.longitude,
        }}
        title={SHUTTLE_STOPS.SGW.name}
        description="Concordia Shuttle Stop"
      >
        <View style={[globalStyles.shuttleStopMarker]}>
          <Text style={[globalStyles.shuttleStopText]}>🚌</Text>
          <Text style={[globalStyles.shuttleStopText]}>SGW</Text>
        </View>
      </Marker>

      {/* Shuttle Stop Marker for Loyola */}
      <Marker
        testID="loy-campus-shuttle-stop"
        coordinate={{
          latitude: SHUTTLE_STOPS.LOYOLA.latitude,
          longitude: SHUTTLE_STOPS.LOYOLA.longitude,
        }}
        title={SHUTTLE_STOPS.LOYOLA.name}
        description="Concordia Shuttle Stop"
      >
        <View style={[globalStyles.shuttleStopMarker]}>
          <Text style={[globalStyles.shuttleStopText]}>🚌</Text>
          <Text style={[globalStyles.shuttleStopText]}>LOY</Text>
        </View>
      </Marker>
    </>
  );
};

/**
 * Fetches real-time shuttle bus data from Concordia's shuttle service.
 * @returns Promise containing bus points and optional route points
 * @throws Error if the fetch request fails
 */
export const fetchShuttleData = async (): Promise<{
  busPoints: any[];
  routePoints?: LatLng[];
}> => {
  try {
    console.log("Fetching shuttle data...");
    
    // Directly fetch shuttle locations without using the ShuttleViewModel class
    // You'll need to implement this function to replace the class-based implementation
    const locations = await fetchShuttleLocations();
    
    const busPoints = locations.filter((point: any) => 
      point._id && point._id.startsWith("BUS")
    );
    
    let routePoints: LatLng[] | undefined;
    if (busPoints.length > 0) {
      const validBusPoints = busPoints.filter((bus: any) => {
        const lat = parseFloat(bus.Latitude);
        const lng = parseFloat(bus.Longitude);
        return lat >= 45.45 && lat <= 45.51 && lng >= -73.65 && lng <= -73.57;
      });
      
      if (validBusPoints.length > 0) {
        const sortedBuses = validBusPoints.sort(
          (a: any, b: any) => a.Longitude - b.Longitude
        );
        
        routePoints = [
          {
            latitude: SHUTTLE_STOPS.LOYOLA.latitude,
            longitude: SHUTTLE_STOPS.LOYOLA.longitude,
          },
          ...sortedBuses.map((bus: any) => ({
            latitude: parseFloat(bus.Latitude),
            longitude: parseFloat(bus.Longitude),
          })),
          {
            latitude: SHUTTLE_STOPS.SGW.latitude,
            longitude: SHUTTLE_STOPS.SGW.longitude,
          },
        ];
      }
    }
    
    return { busPoints, routePoints };
  } catch (error) {
    console.error("Error fetching shuttle data:", error);
    throw error;
  }
};

// Helper function to replace ShuttleViewModel's fetchShuttleLocations method
const fetchShuttleLocations = async () => {
  try {
    // Replace with the API call that was in the ShuttleViewModel class
    const response = await axios.get('YOUR_SHUTTLE_API_ENDPOINT');
    return response.data || [];
  } catch (error) {
    console.error("Error fetching shuttle locations:", error);
    return [];
  }
};

// Helper function to replace ShuttleViewModel's getNextDepartureTime method
const getNextDepartureTime = async (campus: 'SGW' | 'LOYOLA') => {
  try {
    // Replace with the logic that was in the repository method
    // This is a simplified example - adjust according to your actual implementation
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Example logic for calculating next departure
    let departureHour = hours;
    let departureMinute = minutes < 30 ? 30 : 0;
    if (minutes >= 30) departureHour = (hours + 1) % 24;
    
    const departureTime = `${departureHour}:${departureMinute === 0 ? '00' : departureMinute}`;
    const waitTime = departureMinute === 0 ? 60 - minutes : 30 - (minutes % 30);
    
    return {
      departureTime,
      waitTime
    };
  } catch (error) {
    console.error("Error getting departure time:", error);
    return { departureTime: "Unknown", waitTime: 0 };
  }
};

// Replace the class-based ShuttleViewModel with a functional facade
/**
 * Creates a facade for shuttle-related operations including location tracking and route calculation.
 * @param params - Object containing setter functions for shuttle state management
 * @returns Object containing shuttle-related utility functions
 */
export const createShuttleFacade = ({
  setShuttleLocations,
  setEstimatedWaitTime,
  setShuttlePolyline,
}: {
  setShuttleLocations: (locs: any[]) => void;
  setEstimatedWaitTime: (time: number | null) => void;
  setShuttlePolyline: (polyline: LatLng[] | null) => void;
}) => {
  
  const fetchShuttleDirections = async (
    startPoint: any,
    endPoint: any,
    googleMapsApiKey: string,
    decodePolyline: (encoded: string) => LatLng[],
    sanitizeHtmlContent: (html: string) => string
  ): Promise<{ shuttlePolyline: LatLng[]; directions: any[] }> => {
    console.log("Fetching shuttle directions...");
    const toShuttleStop = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: `${startPoint.latitude},${startPoint.longitude}`,
          destination: `${
            SHUTTLE_STOPS[startPoint.campus === "SGW" ? "SGW" : "LOYOLA"]
              .latitude
          },${
            SHUTTLE_STOPS[startPoint.campus === "SGW" ? "SGW" : "LOYOLA"]
              .longitude
          }`,
          mode: "walking",
          key:
            Constants.expoConfig?.extra?.googleMapsApiKey ??
            process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
            "",
        },
      }
    );
    
    if (!toShuttleStop.data.routes?.[0]?.legs?.[0]) {
      throw new Error("Invalid route data for path to shuttle stop");
    }
    
    const shuttleRoute = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: `${
            SHUTTLE_STOPS[startPoint.campus === "SGW" ? "SGW" : "LOYOLA"]
              .latitude
          },${
            SHUTTLE_STOPS[startPoint.campus === "SGW" ? "SGW" : "LOYOLA"]
              .longitude
          }`,
          destination: `${
            SHUTTLE_STOPS[endPoint.campus === "SGW" ? "SGW" : "LOYOLA"].latitude
          },${
            SHUTTLE_STOPS[endPoint.campus === "SGW" ? "SGW" : "LOYOLA"]
              .longitude
          }`,
          mode: "driving",
          key:
            Constants.expoConfig?.extra?.googleMapsApiKey ??
            process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
            "",
        },
      }
    );
    
    if (!shuttleRoute.data.routes?.[0]?.legs?.[0]) {
      throw new Error("Invalid shuttle route data");
    }
    
    const fromShuttleStop = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: `${
            SHUTTLE_STOPS[endPoint.campus === "SGW" ? "SGW" : "LOYOLA"].latitude
          },${
            SHUTTLE_STOPS[endPoint.campus === "SGW" ? "SGW" : "LOYOLA"]
              .longitude
          }`,
          destination: `${endPoint.latitude},${endPoint.longitude}`,
          mode: "walking",
          key: googleMapsApiKey,
        },
      }
    );
    
    if (!fromShuttleStop.data.routes?.[0]?.legs?.[0]) {
      throw new Error("Invalid route data from shuttle stop");
    }
    
    const departureInfo = await getNextDepartureTime(
      startPoint.campus === "SGW" ? "SGW" : "LOYOLA"
    );
    
    // Fetch shuttle data directly instead of using the class
    const { busPoints, routePoints } = await fetchShuttleData();
    setShuttleLocations(busPoints);
    
    const initialRoute = decodePolyline(
      shuttleRoute.data.routes[0].overview_polyline.points
    );
    setShuttlePolyline(initialRoute);
    
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
        departureInfo,
      },
      ...fromShuttleStop.data.routes[0].legs[0].steps.map((step: any) => ({
        instruction: sanitizeHtmlContent(step.html_instructions),
        distance: step.distance.text,
        duration: step.duration.text,
      })),
    ];
    
    return { shuttlePolyline: initialRoute, directions: combinedSteps };
  };

  /**
   * Tracks shuttle locations and updates estimated waiting times.
   * @param startPoint - Starting location object for wait time calculation
   */
  const trackShuttles = async (startPoint: any) => {
    try {
      // Fetch shuttle locations directly
      const locations = await fetchShuttleLocations();
      setShuttleLocations(locations);
      
      if (startPoint) {
        // Calculate estimated wait time based on current time and shuttle schedule
        const departureInfo = await getNextDepartureTime(
          startPoint.campus === "SGW" ? "SGW" : "LOYOLA"
        );
        setEstimatedWaitTime(departureInfo.waitTime);
      }
    } catch (error) {
      console.error("Error tracking shuttles:", error);
    }
  };

  return {
    fetchShuttleData,
    fetchShuttleDirections,
    trackShuttles,
  };
};

export default {};