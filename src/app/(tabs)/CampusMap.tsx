import React, { useState, useRef, useEffect } from "react";
import { View, Text, Switch, StyleSheet, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import MapView, { Marker, Region, Polygon, Circle } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { globalStyles, mainEdges } from "../styles/globalStyles";
import { Campus } from "@/models/Campus";
import { OutdoorLocation } from "@/models/OutdoorLocation";
import buildingsData from "@/data/hardcodedBuildings.json";

// Define outdoor locations
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

//CampusMap Component
interface CampusMapProps {
  campusId: string;
}

// Define campuses
const SGWCampus: Campus = {
  id: "sgw-uuid",
  name: "SGW Campus",
  outdoorLocation: "loc-sgw",
  buildingIds: [],
};

const LoyolaCampus: Campus = {
  id: "loyola-uuid",
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
        const foregroundStatus = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus.status !== 'granted') {
          setLocationError('Permission to access location was denied');
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
        console.error('Error getting location:', err);
        setLocationError('Error getting location');
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
                setSelectedBuildingId(building._id);
              }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={globalStyles.marker}>
                <View style={globalStyles.buildingButton}>
                  <Text style={globalStyles.buildingButtonText}>{buildingNameInitials}</Text>
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
        if (status !== 'granted') {
          setLocationError('Location permission required');
          return;
        }
        setPermissionGranted(true);
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
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
      console.error('Error updating location:', error);
      setLocationError('Failed to get current location');
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
          <View style={globalStyles.buildingInfoContainer}>
            <Text style={globalStyles.buildingNameText}>{buildingInfo.name}</Text>
            <Text style={globalStyles.openingHoursText}>{buildingInfo.openingHours}</Text>
            <Text style={globalStyles.addressText}>{buildingInfo.address}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[globalStyles.refreshButton, isRefreshing && globalStyles.refreshButtonDisabled]}
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
  const currentCampusId = isSGWCampus ? SGWCampus.id : LoyolaCampus.id;

  return (
    <SafeAreaView style={globalStyles.container} edges={mainEdges}>
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
