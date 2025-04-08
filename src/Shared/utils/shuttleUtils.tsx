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

// Export createShuttleFacade from the facade file
export { createShuttleFacade, fetchShuttleData } from "../facades/ShuttleFacade";