import React, { useState, useRef, useEffect } from "react";
import sanitizeHtml from "sanitize-html";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ViewStyle,
  ScrollView,
} from "react-native";
import MapView, { Marker, Region, LatLng, Polygon, Polyline } from "react-native-maps";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import * as Location from "expo-location";
import axios from "axios";
import { globalStyles, mainEdges } from "../styles/globalStyles";
import { Campus } from "@/models/Campus";
import { OutdoorLocation } from "@/models/Location";
import buildingsData from "@/data/hardcodedBuildings.json";

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
            testID={`building-marker-${building._id}`}
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

  const fetchDirections = async (mode: string) => {
    if (buildingInfo && userLocation) {
      const origin = `${userLocation?.latitude},${userLocation?.longitude}`;
      const destination = `${buildingInfo.latitude},${buildingInfo.longitude}`;

      try {
        const response = await axios.get(
          "https://maps.googleapis.com/maps/api/directions/json",
          {
            params: {
              origin,
              destination,
              mode,
              key: "1234",
            },
          }
        );

        const route = response.data.routes[0];
        const polyline = route.overview_polyline.points;
        const decodedRoute = decodePolyline(polyline);
        setNewRoute(decodedRoute);

        const steps = route.legs[0].steps.map((step: any) => ({
          instruction: sanitizeHtml(step.html_instructions, { allowedTags: [], allowedAttributes: {} }),
          distance: step.distance.text,
          duration: step.duration.text,
        }));

        setDirections(steps);
      } catch (error) {
        console.error("Error fetching directions:", error);
      }
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
    fetchDirections("walking");
    handleNavigationPopup();
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

  const resetPopupAndDirections = () => {
    setBuildingInfo(null);
    setSelectedBuildingId(null);
    setShowNavigationPopup(false);
    setStartingAddress("");
    setDestinationAddress("");
    setNewRoute(null);
    setDirections([]);
  };

  const handleNavigationPopup = () => {
    if (buildingInfo) {
      setStartingAddress("My Location");
      setDestinationAddress(buildingInfo.address);
      setShowNavigationPopup(true);
    }
  };

  const handleGoToBuilding = () => {
    handleGoToNavigation();
    handleNavigationPopup();
  };

  const handleClosePopup = () => {
    setBuildingInfo(null);
    setSelectedBuildingId(null);
    setShowNavigationPopup(false);
    setStartingAddress("");
    setDestinationAddress("");
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
          testID="campus-map"
        >

          {permissionGranted && userLocation && (
            <Marker
              coordinate={userLocation}
              title="Your Location"
              pinColor="green"
              testID="user-location-marker"
            />
          )}
          {newRoute && (
            <>
              <Polyline coordinates={newRoute} strokeColor="#186DEE" strokeWidth={4} />
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
            </>
          )}
          {renderBuildings()}
        </MapView>
      </TouchableWithoutFeedback>

      {buildingInfo && (
        <View style={globalStyles.popupContainer}>
          {showNavigationPopup ? (
            <>
              <View style={globalStyles.popupRow}>
                <View style={globalStyles.greenDot} />
                <Text style={globalStyles.popupText}>{startingAddress}</Text>
              </View>
              <View style={globalStyles.separator} />
              <View style={globalStyles.popupRow}>
                <View style={globalStyles.goldDot} />
                <Text style={globalStyles.popupText}>{destinationAddress}</Text>
              </View>
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
              <TouchableOpacity
                onPress={handleGoToBuilding}
                style={globalStyles.addButton}
              >
                <Text style={globalStyles.refreshButtonText}>
                  Go to {buildingInfo.name}
                </Text>
              </TouchableOpacity>
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
            <TouchableOpacity onPress={resetPopupAndDirections} style={globalStyles.cancelButton}>
              <Text style={globalStyles.cancelButtonText}>×</Text>
            </TouchableOpacity>

          </View>

          <View style={globalStyles.transportModes}>
            {['walking', 'driving', 'transit', 'bicycling'].map((mode) => (
              <TouchableOpacity key={mode} onPress={() => handleTransportModeChange(mode)}>
                <Text style={activeTab === mode ? globalStyles.activeModeTabText : globalStyles.modeTabText}>
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={globalStyles.directionsScroll}>
            {directions.map((step, index) => (
              <View key={index} style={globalStyles.directionStep}>
                <Text>{step.instruction}</Text>
                <Text>{step.distance} | {step.duration}</Text>
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
      testID="campus-switcher-container"
    >
      <View style={globalStyles.switchHeaderContainer}>
        <View style={globalStyles.campusSwitchHeader}>
          <View
            style={globalStyles.switchContainer}
            testID="campus-switch-container"
          >
            <Text style={globalStyles.switchText}>SGW</Text>
            <Switch
              value={!isSGWCampus}
              onValueChange={() => setIsSGWCampus(!isSGWCampus)}
              testID="campus-switch"
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
