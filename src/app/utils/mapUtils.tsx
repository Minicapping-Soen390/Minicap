import React from "react";
import { View, Text } from "react-native";
import { Polygon, Marker, LatLng, Region } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import sanitizeHtml from "sanitize-html"; // Safe HTML sanitization function using sanitize-html library

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

    const deltaLat = (result & 0x01) ? ~(result >> 1) : result >> 1;
    latitude += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 0x01) ? ~(result >> 1) : result >> 1;
    longitude += deltaLng;

    path.push({
      latitude: latitude / 1e5,
      longitude: longitude / 1e5,
    });

  }

  return path;
};

// Function to check if a point is inside a polygon
export const isPointInPolygon = (point: LatLng, polygon: LatLng[]): boolean => {
  let inside = false;
  const x = point.longitude,
    y = point.latitude;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude,
      yi = polygon[i].latitude;
    const xj = polygon[j].longitude,
      yj = polygon[j].latitude;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
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
  setShowNavigationPopup: (flag: boolean) => void;
  setIsNavigationStarted: (flag: boolean) => void;
  setNewRoute: (route: LatLng[] | null) => void;
  setDirections: (steps: any[]) => void;
  shuttleFacade: { //so fetchDirections can call shuttle functions if needed
    fetchShuttleDirections: (
      startPoint: any,
      endPoint: any,
      googleMapsApiKey: string,
      decodePolyline: (encoded: string) => LatLng[],
      sanitizeHtmlContent: (html: string) => string
    ) => Promise<{ shuttlePolyline: LatLng[]; directions: any[] }>;
  };
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
    setShowNavigationPopup,
    showNavigationPopup,
    setIsNavigationStarted,
    setNewRoute,
    setDirections,
    shuttleFacade,
  } = params;

  const getUserLocation = async (): Promise<Region | void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
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
      return newRegion;
    } catch (err) {
      console.error("Error getting location:", err);
      setLocationError("Error getting location");
    }
  };

  // Clears building selection.
  const handleMapPress = () => {
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
        console.warn(`Building ${building._id} does not have a valid polygonShape`);
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
                <Text style={globalStyles.buildingButtonText}>{buildingNameInitials}</Text>
              </View>
            </View>
          </Marker>
        </React.Fragment>
      );
    });
  };

  const handleBuildingSelection = (building: any, selectionType: "start" | "end") => {
    if (!building || !building.name) {
      console.error("Invalid building data:", building);
      Alert.alert("Error", "Invalid building data");
      return;
    }
    const info = {
      name: building.name,
      address: building.address,
      openingHours: building.openingHours,
      latitude: building.latitude || 0,
      longitude: building.longitude || 0,
      campus: building.campus,
    };
    if (selectionType === "start") {
      setStartPoint(info);
      setBuildingInfo(info);
      setSelectedBuildingId(building._id);
      Alert.alert("Start Point Selected", `Selected ${building.name} as start point. Now select your destination.`);
    } else {
      // When setting end point, use current location as start if not already set
      if (!startPoint) {
        if (userLocation) {
          const userLocationInfo = {
            name: "My Location",
            address: "Current Location",
            openingHours: "",
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            campus: building.campus, // We'll determine the campus based on proximity
          };
          setStartPoint(userLocationInfo);
        } else if (!startPoint && !userLocation){
          // If no start point and no user location, request location permission
          Alert.alert(
            "Location Required",
            "Please enable location services to use your current location as the starting point.");
          return;
        }
      }
      setEndPoint(info);
      setBuildingInfo(info);
      setSelectedBuildingId(building._id);
      Alert.alert("Destination Selected", `Selected ${building.name} as destination. Starting navigation.`);
    }
  };

  // Fetch regular directions using Google Directions API.
  const fetchRegularDirections = async (
    startPoint: any,
    endPoint: any,
    mode: string,
    googleMapsApiKey: string
  ): Promise<{ decodedRoute: LatLng[]; steps: any[] }> => {
    const response = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
      params: {
        origin: `${startPoint.latitude},${startPoint.longitude}`,
        destination: `${endPoint.latitude},${endPoint.longitude}`,
        mode,
        key: googleMapsApiKey,
      },
    });
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
    return { decodedRoute, steps };
  };

  const fetchDirections = async (mode: string, googleMapsApiKey: string) => { // If campuses differ and mode is "transit", use the shuttle facade
    if (!startPoint || !endPoint) {
      console.error("Start or end point is missing");
      return;
    }
    try {
      if (startPoint.campus !== endPoint.campus && mode === "transit") {
        const { shuttlePolyline, directions } = await shuttleFacade.fetchShuttleDirections(
          startPoint,
          endPoint,
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
        setShuttlePolyline(null);
        const { decodedRoute, steps } = await fetchRegularDirections(
          startPoint,
          endPoint,
          mode,
          googleMapsApiKey
        );
        setNewRoute(decodedRoute);
        setDirections(steps);
        setIsNavigationStarted(true);
        setBuildingInfo(null);
      }
    } catch (error) {
      console.error("Error in fetchDirections:", error);
      Alert.alert("Error", "Failed to fetch route details.");
    }
  };

  const resetNavigation = () => {
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

  return {
    getUserLocation,
    handleMapPress,
    renderBuildings,
    handleBuildingSelection,
    fetchRegularDirections,
    fetchDirections,
    resetNavigation,
    handleNavigationPopup,
  };
};

export default {};
