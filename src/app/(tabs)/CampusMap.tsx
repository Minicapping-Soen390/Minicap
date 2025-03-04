import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import MapView, { Marker, Region, Polygon, LatLng } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Campus } from "@/models/Campus";
import { OutdoorLocation } from "@/models/Location";
import buildingsData from "@/data/hardcodedBuildings.json";
import { ObjectId } from "mongodb";

// Outdoor locations
const outdoorLocationSGW: OutdoorLocation = {
  id: "loc-sgw",
  locationType: "outdoor",
  latitude: 45.4973,
  longitude: -73.5789,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
  _id: new ObjectId(),
};

const outdoorLocationLoyola: OutdoorLocation = {
  id: "loc-loyola",
  locationType: "outdoor",
  latitude: 45.4581,
  longitude: -73.6405,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
  _id: new ObjectId(),
};

// CampusMap Component
interface CampusMapProps {
  campusId: string;
}

// Define Campuses
const SGWCampus: Campus = {
  id: "sgw-ObjectId",
  name: "SGW Campus",
  outdoorLocation: "loc-sgw",
  buildingIds: [],
  _id: new ObjectId(),
};

const LoyolaCampus: Campus = {
  id: "loyola-ObjectId",
  name: "Loyola Campus",
  outdoorLocation: "loc-loyola",
  buildingIds: [],
  _id: new ObjectId(),
};

const CampusMap: React.FC<CampusMapProps> = ({ campusId }) => {
  const campus = campusId === SGWCampus.id ? SGWCampus : LoyolaCampus;
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
        insideSelected: {
          fill: "rgba(255, 165, 0, 0.5)",
          stroke: "rgb(30, 79, 5)",
        },
        inside: { fill: "rgba(46, 118, 10, 0.41)", stroke: "rgb(30, 79, 5)" },
        selected: {
          fill: "rgba(255, 165, 0, 0.5)",
          stroke: "rgb(165, 35, 35)",
        },
        default: { fill: "rgba(180, 16, 16, 0.5)", stroke: "rgb(165, 35, 35)" },
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
            <View style={styles.marker}>
              <View style={styles.buildingButton}>
                <Text style={styles.buildingButtonText}>
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
      <View style={styles.mapContainer}>
        {locationError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        ) : null}
        <MapView
          ref={(ref) => (mapRef.current = ref)}
          style={styles.map}
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
          <View style={styles.buildingInfoContainer}>
            <Text style={styles.buildingNameText}>{buildingInfo.name}</Text>
            <Text style={styles.openingHoursText}>
              {buildingInfo.openingHours}
            </Text>
            <Text style={styles.addressText}>{buildingInfo.address}</Text>
            <TouchableOpacity
              onPress={handleAddToNavigation}
              style={styles.addButton}
            >
              <Text style={styles.buttonText}>Add to Navigation</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.refreshButton,
            isRefreshing && styles.refreshButtonDisabled,
          ]}
          onPress={updateUserLocation}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.buttonText}>My Location</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

// CampusSwitcher Component
const CampusSwitcher: React.FC = () => {
  const [isSGWCampus, setIsSGWCampus] = useState<boolean>(true);
  const currentCampusId = isSGWCampus ? SGWCampus.id : LoyolaCampus.id;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.switchContainer}>
        <Text>SGW Campus</Text>
        <Switch
          value={!isSGWCampus}
          onValueChange={() => setIsSGWCampus(!isSGWCampus)}
        />
        <Text>Loyola Campus</Text>
      </View>
      <CampusMap campusId={currentCampusId} />
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  refreshButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 255, 0.7)",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  switchContainer: {
    position: "absolute",
    top: 10,
    left: "33%",
    transform: [{ translateX: -50 }],
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 1,
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
    zIndex: 2,
  },
  errorText: {
    color: "white",
    textAlign: "center",
  },
  refreshButtonDisabled: {
    backgroundColor: "rgba(0, 0, 255, 0.4)",
  },
  buildingInfoContainer: {
    position: "absolute",
    top: 50,
    alignSelf: "center",
    backgroundColor: "rgb(255, 255, 255)",
    padding: 15,
    borderRadius: 10,
    width: "85%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 2,
  },
  buildingNameText: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
  },
  openingHoursText: {
    color: "gray",
    marginBottom: 5,
  },
  addressText: {
    color: "#555",
    fontSize: 14,
  },
  marker: {
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  buildingButton: {
    width: 25,
    height: 25,
    backgroundColor: "rgb(165, 35, 35)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  buildingButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "rgba(0, 255, 0, 0.7)",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default CampusSwitcher;
