//shuttleUtils.tsx
import axios from "axios";
import { View, Text } from "react-native";
import { Marker, LatLng, Region } from "react-native-maps";
import { SHUTTLE_STOPS } from "@/MVVM/services/ShuttleService";
import { ShuttleViewModel } from "@/MVVM/viewmodels/ShuttleViewModel";
import Constants from "expo-constants";

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

export const fetchShuttleData = async (): Promise<{
  busPoints: any[];
  routePoints?: LatLng[];
}> => {
  try {
    console.log("Fetching shuttle data...");
    
    // Use ShuttleViewModel instead of direct API calls
    const shuttleViewModel = new ShuttleViewModel();
    await shuttleViewModel.fetchShuttleLocations();
    const locations = shuttleViewModel.locations;
    
    const busPoints = locations.filter((point: any) => 
      point._id.startsWith("BUS")
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

export const createShuttleFacade = ({
  setShuttleLocations,
  setEstimatedWaitTime,
  setShuttlePolyline,
}: {
  setShuttleLocations: (locs: any[]) => void;
  setEstimatedWaitTime: (time: number | null) => void;
  setShuttlePolyline: (polyline: LatLng[] | null) => void;
}) => {
  const shuttleViewModel = new ShuttleViewModel();
  
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
    
    const departureInfo = await shuttleViewModel.getNextDepartureInfo(
      startPoint.campus === "SGW" ? "SGW" : "LOYOLA"
    );
    
    await fetchShuttleData();
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

  const trackShuttles = async (startPoint: any) => {
    try {
      await shuttleViewModel.fetchShuttleLocations();
      setShuttleLocations(shuttleViewModel.locations);
      
      if (startPoint && shuttleViewModel.estimatedWaitTime !== null) {
        setEstimatedWaitTime(shuttleViewModel.estimatedWaitTime);
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
