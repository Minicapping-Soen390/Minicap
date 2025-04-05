//mapUtils.tsx
import React from "react";
import { View, Text, Alert } from "react-native";
import { Polygon, Marker, LatLng, Region } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import sanitizeHtml from "sanitize-html"; // Safe HTML sanitization function using sanitize-html library
import Constants from "expo-constants";
import { determineUserCampus } from "./shuttleUtils";

export const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: [], // Remove all HTML tags
    allowedAttributes: {}, // Remove all attributes
  }).trim();
};

export const decodePolyline = (encoded: string) => {
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

    const deltaLat = result & 0x01 ? ~(result >> 1) : result >> 1;
    latitude += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 0x01 ? ~(result >> 1) : result >> 1;
    longitude += deltaLng;

    path.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });
  }

  return path;
};

export const isPointInPolygon = (point: LatLng, polygon: LatLng[]): boolean => {
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

export const createMapFacade = (params: {
  setUserLocation: (region: Region) => void;
  setLocationError: (error: string | null) => void;
  setPermissionGranted: (flag: boolean) => void;
  setBuildingInfo: (info: any) => void;
  setSelectedBuildingId: (id: string | null) => void;
  setDestinationAddress: (addr: string) => void;
  setStartingAddress: (addr: string) => void;
  setStartPoint: (info: any) => void;
  setEndPoint: (info: any) => void;
  userLocation: Region | null;
  selectedBuildingId: string | null;
  Alert: typeof import("react-native").Alert;
  destinationAddress: string;
  startPoint: any;
  endPoint: any;
  setShowNavigationPopup: (flag: boolean) => void;
  setIsNavigationStarted: (flag: boolean) => void;
  setNewRoute: (route: LatLng[] | null) => void;
  setDirections: (steps: any[]) => void;
  setShuttlePolyline: (polyline: LatLng[] | null) => void;
  setTransportMode: (mode: string) => void;
  setActiveTab: (mode: string) => void;
  setIsCrossCampusNavigation: (flag: boolean) => void;
  shuttleFacade: {
    fetchShuttleDirections: (
      startPoint: any,
      endPoint: any,
      googleMapsApiKey: string,
      decodePolyline: (encoded: string) => LatLng[],
      sanitizeHtmlContent: (html: string) => string
    ) => Promise<{ shuttlePolyline: LatLng[]; directions: any[] }>;
  };
  setTransportMode: (mode: string) => void;
  setActiveTab: (mode: string) => void;
}) => {
  const {
    setUserLocation,
    setLocationError,
    setPermissionGranted,
    setBuildingInfo,
    setSelectedBuildingId,
    setDestinationAddress,
    setStartingAddress,
    setStartPoint,
    setEndPoint,
    userLocation,
    selectedBuildingId,
    Alert,
    destinationAddress,
    startPoint,
    endPoint,
    setShowNavigationPopup,
    setIsNavigationStarted,
    setNewRoute,
    setDirections,
    setShuttlePolyline,
    setTransportMode,
    setActiveTab,
    setIsCrossCampusNavigation,
    shuttleFacade,
  } = params;

  const getUserLocation = async (): Promise<Region | void> => {
    console.log("Requesting user location...");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        console.error("Location permission denied");
        return;
      }
      setPermissionGranted(true);
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const newRegion: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setUserLocation(newRegion);
      console.log("User location set:", newRegion);
      return newRegion;
    } catch (err) {
      console.error("Error getting location:", err);
      setLocationError("Error getting location");
    }
  };

  // Clears building selection.
  const handleMapPress = () => {
    console.log("Map pressed. Clearing building selection.");
    setBuildingInfo(null);
    setSelectedBuildingId(null);
  };

  const renderBuildings = (
    buildingsData: any[],
    globalStyles: any,
    brandColors: any
  ) => {
    return buildingsData.map((building) => {
      if (!Array.isArray(building.polygonShape)) {
        console.warn(
          `Building ${building._id} does not have a valid polygonShape`
        );
        return null;
      }

      const coordinates: LatLng[] = building.polygonShape
        .map((coords: any) => {
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
          acc.latitude += curr.latitude;
          acc.longitude += curr.longitude;
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
        insideSelected: {
          fill: brandColors.orangeTransparent,
          stroke: brandColors.darkGreen,
        },
        inside: {
          fill: brandColors.darkGreenTransparent,
          stroke: brandColors.darkGreen,
        },
        selected: {
          fill: brandColors.orangeTransparent,
          stroke: brandColors.concordiaRed,
        },
        default: {
          fill: brandColors.concordiaRedTransparent,
          stroke: brandColors.concordiaRed,
        },
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
        <React.Fragment key={building._id}>
          <Polygon
            coordinates={coordinates}
            strokeColor={stroke}
            strokeWidth={2}
            fillColor={fill}
          />
          <Marker
            coordinate={center}
            onPress={() => {
              console.log(`Building selected: ${building.name}`);
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
              setShowNavigationPopup(true);
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
        </React.Fragment>
      );
    });
  };

  const handleBuildingSelection = (
    building: any,
    selectionType: "start" | "end"
  ) => {
    if (!isValidBuilding(building)) return;

    const info = extractBuildingInfo(building);

    if (selectionType === "start") {
      handleStartSelection(info, building._id);
      return;
    }

    handleEndSelection(info, building._id);
  };

  // Helper: Building Validation
  const isValidBuilding = (building: any): boolean => {
    if (!building || !building.name) {
      console.error("Invalid building data:", building);
      Alert.alert("Error", "Invalid building data");
      return false;
    }
    return true;
  };

  // Helper: Info object
  const extractBuildingInfo = (building: any) => ({
    name: building.name,
    address: building.address,
    openingHours: building.openingHours,
    latitude: building.latitude ?? 0,
    longitude: building.longitude ?? 0,
    campus: building.campus,
  });

  // Helper: Startpoint
  const handleStartSelection = (info: any, buildingId: string) => {
    console.log(`Setting ${info.name} as start point.`);
    setStartPoint(info);
    setBuildingInfo(info);
    setSelectedBuildingId(buildingId);
    Alert.alert(
      "Start Point Selected",
      `Selected ${info.name} as start point. Now select your destination.`
    );
  };

  // Helper: Endpoint
  const handleEndSelection = (info: any, buildingId: string) => {
    console.log(`Setting ${info.name} as end point.`);

    const start = startPoint ?? getUserLocationFallback();
    if (!start) return;

    const effectiveEndPoint = info;
    setEndPoint(effectiveEndPoint);
    setBuildingInfo(info);
    setSelectedBuildingId(buildingId);

    const isCrossCampus = start.campus !== info.campus;
    setIsCrossCampusNavigation(isCrossCampus);

    const navText = isCrossCampus ? "Cross-Campus Route" : "Route Selected";
    const routeMessage = isCrossCampus
      ? `Route from ${start.name} to ${info.name} will use the shuttle service.`
      : `Route from ${start.name} to ${info.name}`;

    const transportMode = isCrossCampus ? "transit" : "walking";

    Alert.alert(navText, routeMessage, [
      {
        text: "Start Navigation",
        onPress: () =>
          fetchDirections(
            transportMode,
            Constants.expoConfig?.extra?.googleMapsApiKey ?? "",
            start,
            effectiveEndPoint
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // Helper: Get fallback location if needed
  const getUserLocationFallback = () => {
    if (userLocation) {
      const fallback = {
        name: "My Location",
        address: "Current Location",
        openingHours: "",
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        campus: determineUserCampus(userLocation),
      };
      setStartPoint(fallback);
      return fallback;
    }

    Alert.alert(
      "Location Required",
      "Please enable location services to use your current location as the starting point."
    );
    return null;
  };

  const fetchRegularDirections = async (
    startPoint: any,
    endPoint: any,
    mode: string,
    googleMapsApiKey: string
  ): Promise<{ decodedRoute: LatLng[]; steps: any[] }> => {
    console.log("Fetching regular directions...");
    try {
      const response = await axios.get(
        "https://maps.googleapis.com/maps/api/directions/json",
        {
          params: {
            origin: `${startPoint.latitude},${startPoint.longitude}`,
            destination: `${endPoint.latitude},${endPoint.longitude}`,
            mode,
            key:
              Constants.expoConfig?.extra?.googleMapsApiKey ??
              process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          },
        }
      );
      console.log("Regular directions response:", response.data);
      if (!response.data.routes?.[0]?.legs?.[0]) {
        throw new Error("Invalid route data received");
      }
      const route = response.data.routes[0];
      if (!route.overview_polyline) {
        throw new Error("No overview_polyline found in the route");
      }
      const polyline = route.overview_polyline.points;
      const decodedRoute = decodePolyline(polyline);
      const steps = route.legs[0].steps.map((step: any) => ({
        instruction: sanitizeHtmlContent(step.html_instructions),
        distance: step.distance.text,
        duration: step.duration.text,
      }));
      console.log("Decoded route:", decodedRoute);
      console.log("Steps:", steps);
      return { decodedRoute, steps };
    } catch (error) {
      console.error("Error fetching regular directions:", error);
      throw error;
    }
  };

  const fetchDirections = async (
    mode: string,
    googleMapsApiKey: string,
    customStartPoint?: any,
    customEndPoint?: any
  ) => {
    const realStart = customStartPoint ?? startPoint;
    const realEnd = customEndPoint ?? endPoint;

    console.log("Fetching directions...");
    console.log("Start Point:", realStart);
    console.log("End Point:", realEnd);

    if (!realStart || !realEnd) {
      Alert.alert("Error", "Both start and end points must be set.");
      return;
    }

    try {
      if (realStart.campus !== realEnd.campus && mode === "transit") {
        const { shuttlePolyline, directions } =
          await shuttleFacade.fetchShuttleDirections(
            realStart,
            realEnd,
            googleMapsApiKey,
            decodePolyline,
            sanitizeHtmlContent
          );
        setShuttlePolyline(shuttlePolyline);
        setNewRoute(null);
        setDirections(directions);
        setIsNavigationStarted(true);
        setBuildingInfo(null);
      } else {
        const { decodedRoute, steps } = await fetchRegularDirections(
          realStart,
          realEnd,
          mode,
          googleMapsApiKey
        );
        setShuttlePolyline(null);
        setNewRoute(decodedRoute);
        setDirections(steps);
        setIsNavigationStarted(true);
        setBuildingInfo(null);
      }
    } catch (error) {
      console.error("Error in fetchDirections:", error);
      setShuttlePolyline(null);
      setNewRoute([]);
      setDirections([
        { instruction: "Could not fetch route", distance: "", duration: "" },
      ]);
      setIsNavigationStarted(true);
      setBuildingInfo(null);
    }
  };

  const resetNavigation = () => {
    console.log("Resetting navigation...");
    setStartPoint(null);
    setEndPoint(null);
    setBuildingInfo(null);
    setSelectedBuildingId(null);
    setNewRoute(null);
    setDirections([]);
    setIsNavigationStarted(false);
  };

  const handleNavigationPopup = () => {
    if (buildingInfo) {
      setStartingAddress("My Location");
      setDestinationAddress(buildingInfo.address);
      setShowNavigationPopup(true);
    }
  };

  const handleTransportModeChange = (mode: string) => {
    setTransportMode(mode);
    setActiveTab(mode);
    const apiKey =
      Constants.expoConfig?.extra?.googleMapsApiKey ??
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
      "";
    fetchDirections(mode, apiKey);
  };

  return {
    getUserLocation,
    handleMapPress,
    renderBuildings,
    handleBuildingSelection,
    fetchRegularDirections,
    fetchDirections,
    resetNavigation,
    handleNavigationPopup,
    handleTransportModeChange,
  };
};

export default {};
