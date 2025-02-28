import React, { useState, useRef, useEffect } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableWithoutFeedback } from "react-native";
import MapView, { Marker, Region, Polygon, Circle } from "react-native-maps";

import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { Campus } from "@/models/Campus";
import { OutdoorLocation } from "@/models/Location";
import buildingsData from "@/data/hardcodedBuildings.json";

// Outdoor locations
const outdoorLocationSGW: OutdoorLocation = {
  id: "loc-sgw",
  locationType: "outdoor",
  latitude: 45.4973,
  longitude: -73.5789,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const outdoorLocationLoyola: OutdoorLocation = {
  id: "loc-loyola",
  locationType: "outdoor",
  latitude: 45.4581,
  longitude: -73.6405,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
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
};

const LoyolaCampus: Campus = {
  id: "loyola-ObjectId",
  name: "Loyola Campus",
  outdoorLocation: "loc-loyola",
  buildingIds: [],
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
  const [buildingInfo, setBuildingInfo] = useState<{ name: string; address: string; openingHours: string } | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

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

  const renderBuildings = () => {
    return buildingsData.map((building) => {
      if (Array.isArray(building.polygonShape)) {
        const coordinates = building.polygonShape.map((coords) => {
          if (Array.isArray(coords) && coords.length === 2) {
            const [longitude, latitude] = coords;
            return { latitude, longitude };
          }
          console.warn(`Invalid coordinates for building ${building._id}`);
          return null;
        }).filter(coord => coord !== null);

        const center = coordinates.reduce((acc, curr) => {
          acc.latitude += curr.latitude;
          acc.longitude += curr.longitude;
          return acc;
        }, { latitude: 0, longitude: 0 });

        center.latitude /= coordinates.length;
        center.longitude /= coordinates.length;

        // Determine the fill color based on whether the building is selected
        const fillColor = selectedBuildingId === building._id ? "rgba(255, 165, 0, 0.5)" : "rgba(180, 16, 16, 0.48)";

        // Get the first two letters of the building name
        const buildingNameInitials = building.name.substring(0, 2).toUpperCase();

        return (
          <View key={building._id}>
            <Polygon
              coordinates={coordinates}
              strokeColor="rgb(165, 35, 35)"
              strokeWidth={2}
              fillColor={fillColor}
            />
            <Marker
              coordinate={center}
              onPress={() => {
                setBuildingInfo({ name: building.name, address: building.address, openingHours: building.openingHours });
                setSelectedBuildingId(building._id); // Set selected building ID
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.marker}>
                <View style={styles.buildingButton}>
                  <Text style={styles.buildingButtonText}>{buildingNameInitials}</Text>
                </View>
              </View>
            </Marker>
          </View>
        );
      }
      console.warn(`Building ${building._id} does not have a valid polygonShape`);
      return null;
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
    if (buildingInfo) {
      setBuildingInfo(null);
      setSelectedBuildingId(null); // Reset selected building ID
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
            coordinate={{ latitude: region.latitude, longitude: region.longitude }}
            title={campus.name}
          />
          {permissionGranted && userLocation && (
            <Marker
              coordinate={userLocation}
              title="Your Location"
              pinColor="blue"
            />
          )}
          {renderBuildings()}

          {userLocation && (
            <Circle
              center={userLocation}
              radius={10}
              fillColor="rgba(0, 0, 255, 0.5)"
              strokeColor="rgba(0, 0, 255, 1)"
            />
          )}
        </MapView>

        {buildingInfo && (
          <View style={styles.buildingInfoContainer}>
            <Text style={styles.buildingNameText}>{buildingInfo.name}</Text>
            <Text style={styles.openingHoursText}>{buildingInfo.openingHours}</Text>
            <Text style={styles.addressText}>{buildingInfo.address}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.refreshButton, isRefreshing && styles.refreshButtonDisabled]}
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
          testID="campus-switch"
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
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: 'rgb(255, 255, 255)',
    padding: 15,
    borderRadius: 10,
    width: '85%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 2,
  },
  buildingNameText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  openingHoursText: {
    color: 'gray',
    marginBottom: 5,
  },
  addressText: {
    color: '#555',
    fontSize: 14,
  },
  marker: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingButton: {
    width: 25,
    height: 25,
    backgroundColor: 'rgb(165, 35, 35)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buildingButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CampusSwitcher;
