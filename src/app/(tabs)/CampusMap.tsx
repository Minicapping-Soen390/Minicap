import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  ViewStyle,
} from "react-native";
import MapView, { Marker, Region, Polygon, LatLng } from "react-native-maps";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { globalStyles, mainEdges } from "../styles/globalStyles";
import { Campus } from "@/models/Campus";
import { OutdoorLocation } from "@/models/Location";
import buildingsData from "@/data/hardcodedBuildings.json";
import { ObjectId } from "mongodb";

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
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null
  );
  const [newRoute, setNewRoute] = useState<any>(null); // State to hold the new route object

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
              setBuildingInfo({
                name: building.name,
                address: building.address,
                openingHours: building.openingHours,
                latitude: center.latitude,
                longitude: center.longitude,
              });
              setSelectedBuildingId(building._id);
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
    if (buildingInfo) {
      setBuildingInfo(null);
      setSelectedBuildingId(null); // Reset selected building ID
    }
  };

  const handleAddToNavigation = () => {
    if (buildingInfo) {
      const newRouteSegment = {
        startPoint: {
          latitude: buildingInfo.latitude,
          longitude: buildingInfo.longitude,
        },
        endPoint: {
          latitude: userLocation?.latitude || 0,
          longitude: userLocation?.longitude || 0,
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
        </MapView>

        {buildingInfo && (
          <View style={globalStyles.buildingInfoContainer}>
            <Text style={globalStyles.buildingNameText}>
              {buildingInfo.name}
            </Text>
            <Text style={globalStyles.openingHoursText}>
              {buildingInfo.openingHours}
            </Text>
            <Text style={globalStyles.addressText}>{buildingInfo.address}</Text>
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
