import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ViewStyle,
  Alert,
  Linking,
} from "react-native";
import MapView, { Marker, Region, Polygon, LatLng, Polyline } from "react-native-maps";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { globalStyles, mainEdges, colors } from "../styles/globalStyles";
import { Campus } from "@/models/Campus";
import { OutdoorLocation } from "@/models/Location";
import buildingsData from "@/data/hardcodedBuildings.json";
//import { ObjectId } from "mongodb";

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

// Add route coordinates for cross-campus navigation
const crossCampusRouteCoordinates: LatLng[] = [
  { latitude: 45.4973, longitude: -73.5789 }, // SGW Campus
  { latitude: 45.4778, longitude: -73.6097 }, // Midpoint
  { latitude: 45.4581, longitude: -73.6405 }, // Loyola Campus
];

// Add these constants at the top with other constants
const CAMPUS_ENTRANCES = {
  SGW: {
    main: { latitude: 45.4973, longitude: -73.5789 },
    guy: { latitude: 45.4965, longitude: -73.5780 },
    mackay: { latitude: 45.4978, longitude: -73.5795 }
  },
  LOYOLA: {
    main: { latitude: 45.4581, longitude: -73.6405 },
    sherbrooke: { latitude: 45.4575, longitude: -73.6400 },
    west: { latitude: 45.4585, longitude: -73.6410 }
  }
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
  const [newRoute, setNewRoute] = useState<any>(null);
  const [isCrossCampusNavigation, setIsCrossCampusNavigation] = useState(false);
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
  const [showRoute, setShowRoute] = useState(false);

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
        insideSelected: { fill: "#FFA50080", stroke: "#1E4F05" },
        inside: { fill: "#2E760A69", stroke: "#1E4F05" },
        selected: { fill: "#FFA50080", stroke: "#A52323" },
        default: { fill: "#B4101080", stroke: "#A52323" },
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
              handleBuildingSelection(building);
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
        // Coords to test the LB building
        // latitude: 45.49674153452182,
        // longitude: -73.5779170349735,
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
    if (buildingInfo && !isCrossCampusNavigation) {
      setBuildingInfo(null);
      setSelectedBuildingId(null);
    }
  };

  const handleGoToNavigation = () => {
    if (buildingInfo) {
      const newRouteSegment = {
        startPoint: {
          latitude: userLocation?.latitude || 0,
          longitude: userLocation?.longitude || 0,
        },
        endPoint: {
          latitude: buildingInfo.latitude,
          longitude: buildingInfo.longitude,
        },
        transportationMode: "WALKING", // Default transportation mode
        usageCount: 0,
      };

      const newRoute = {
        accessible: true,
        segmentIds: [newRouteSegment],
      };

      setNewRoute(newRoute); // Update the state with the new route object
      console.log("New Route:", JSON.stringify(newRoute, null, 2));
    }
  };

  const handleCrossCampusNavigation = async () => {
    if (!startPoint || !endPoint) {
      Alert.alert("Error", "Please select both start and end points");
      return;
    }

    try {
      setShowRoute(true);
      
      // Determine the best entrance/exit points based on the selected buildings
      const startCampus = startPoint.campus;
      const endCampus = endPoint.campus;
      
      // Select the main entrance/exit for now (can be enhanced with better selection logic)
      const startExit = CAMPUS_ENTRANCES[startCampus as keyof typeof CAMPUS_ENTRANCES].main;
      const endEntrance = CAMPUS_ENTRANCES[endCampus as keyof typeof CAMPUS_ENTRANCES].main;

      // Create a multi-segment route
      const segments = [
        // From start building to campus exit
        `${startPoint.latitude},${startPoint.longitude}`,
        // From campus exit to destination campus entrance
        `${startExit.latitude},${startExit.longitude}`,
        // From destination campus entrance to end building
        `${endEntrance.latitude},${endEntrance.longitude}`,
        `${endPoint.latitude},${endPoint.longitude}`
      ];

      // Create a waypoints URL for Google Maps
      const waypoints = segments.slice(1, -1).map(coord => `via:${coord}`).join('|');
      const url = `https://www.google.com/maps/dir/?api=1&origin=${segments[0]}&destination=${segments[segments.length - 1]}&travelmode=transit&waypoints=${waypoints}`;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          "Error",
          "Google Maps is not installed. Please install it to use navigation."
        );
      }
    } catch (error) {
      console.error("Error opening navigation:", error);
      Alert.alert("Error", "Failed to open navigation");
    }
  };

  const handleBuildingSelection = (building: any) => {
    const buildingInfo = {
      name: building.name,
      address: building.address,
      openingHours: building.openingHours,
      latitude: building.polygonShape[0][1],
      longitude: building.polygonShape[0][0],
      campus: building.campus,
    };

    if (!startPoint) {
      setStartPoint(buildingInfo);
      setBuildingInfo(buildingInfo);
      setSelectedBuildingId(building._id);
      Alert.alert("Start Point Selected", `Selected ${building.name} as start point. Now select your destination.`);
    } else if (!endPoint) {
      setEndPoint(buildingInfo);
      setBuildingInfo(buildingInfo);
      setSelectedBuildingId(building._id);
      setIsCrossCampusNavigation(true);
      Alert.alert("End Point Selected", `Selected ${building.name} as destination. You can now start navigation.`);
    }
  };

  const resetNavigation = () => {
    setStartPoint(null);
    setEndPoint(null);
    setIsCrossCampusNavigation(false);
    setShowRoute(false);
  };

  return (
    <TouchableWithoutFeedback onPress={handleMapPress} accessible={false}>
      <View style={globalStyles.mapContainer}>
        {locationError ? (
          <View style={globalStyles.errorContainer}>
            <Text style={globalStyles.errorText}>{locationError}</Text>
          </View>
        ) : null}
        <MapView
          ref={(ref) => (mapRef.current = ref)}
          style={globalStyles.map}
          initialRegion={region}
          pitchEnabled={false}
          rotateEnabled={false}
          zoomEnabled={true}
          zoomControlEnabled={true}
        >
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title={campus.name}
          />
          {permissionGranted && userLocation && (
            <Marker
              coordinate={userLocation}
              title="Your Location"
              pinColor="green"
            />
          )}
          {renderBuildings()}
          {showRoute && startPoint && endPoint && (
            <Polyline
              coordinates={[
                { latitude: startPoint.latitude, longitude: startPoint.longitude },
                { latitude: CAMPUS_ENTRANCES[startPoint.campus as keyof typeof CAMPUS_ENTRANCES].main.latitude, 
                  longitude: CAMPUS_ENTRANCES[startPoint.campus as keyof typeof CAMPUS_ENTRANCES].main.longitude },
                { latitude: CAMPUS_ENTRANCES[endPoint.campus as keyof typeof CAMPUS_ENTRANCES].main.latitude,
                  longitude: CAMPUS_ENTRANCES[endPoint.campus as keyof typeof CAMPUS_ENTRANCES].main.longitude },
                { latitude: endPoint.latitude, longitude: endPoint.longitude }
              ]}
              strokeColor={colors.concordiaRed}
              strokeWidth={3}
            />
          )}
        </MapView>

        {buildingInfo && !isCrossCampusNavigation && (
          <View style={globalStyles.buildingInfoContainer}>
            <Text style={globalStyles.buildingNameText}>
              {buildingInfo.name}
            </Text>
            <Text style={globalStyles.openingHoursText}>
              {buildingInfo.openingHours}
            </Text>
            <Text style={globalStyles.addressText}>{buildingInfo.address}</Text>
            {!startPoint && (
              <TouchableOpacity
                onPress={() => handleBuildingSelection(buildingInfo)}
                style={globalStyles.addButton}
              >
                <Text style={globalStyles.refreshButtonText}>
                  Select as Start Point
                </Text>
              </TouchableOpacity>
            )}
            {startPoint && !endPoint && (
              <TouchableOpacity
                onPress={() => handleBuildingSelection(buildingInfo)}
                style={globalStyles.addButton}
              >
                <Text style={globalStyles.refreshButtonText}>
                  Select as End Point
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {isCrossCampusNavigation && startPoint && endPoint && (
          <View style={globalStyles.buildingInfoContainer}>
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
              onPress={handleCrossCampusNavigation}
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
      </View>
    </TouchableWithoutFeedback>
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
