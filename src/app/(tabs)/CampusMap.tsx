import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, Region, LatLng } from "react-native-maps";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import { globalStyles, mainEdges, brandColors } from "../styles/globalStyles";
import buildingsData from "@/data/hardcodedBuildings.json";
import campusCenters from "@/data/campusCenters.json";
import { Campus } from "@/models/Campus";
import { createMapFacade } from "../utils/mapUtils";
import { createShuttleFacade, renderShuttleMarkers } from "../utils/shuttleUtils";

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
  const region: Region = campusCenters[campus.outdoorLocation];
  const mapRef = useRef<MapView | null>(null);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [buildingInfo, setBuildingInfo] = useState<any>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [newRoute, setNewRoute] = useState<LatLng[] | null>(null);
  const [setDirections] = useState<any[]>([]);
  const [transportMode] = useState<string>("walking");
  const [activeTab] = useState<string>("walking");
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [startingAddress, setStartingAddress] = useState<string>("");
  const [showNavigationPopup, setShowNavigationPopup] = useState<boolean>(false);
  const [isNavigationStarted, setIsNavigationStarted] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<any>(null);
  const [endPoint, setEndPoint] = useState<any>(null);
  const [setShuttleLocations] = useState<any[]>([]);
  const [setEstimatedWaitTime] = useState<number | null>(null);
  const [shuttlePolyline, setShuttlePolyline] = useState<LatLng[] | null>(null);

  const shuttleFacade = createShuttleFacade({
    setShuttleLocations,
    setEstimatedWaitTime,
    setShuttlePolyline,
  });

  const mapFacade = createMapFacade({
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
  });

  useEffect(() => {
    mapFacade.getUserLocation();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [region]);

  return (
      <View style={globalStyles.mapContainer}>
        {locationError ? (
          <View style={globalStyles.errorContainer}>
            <Text style={globalStyles.errorText}>{locationError}</Text>
          </View>
        ) : null}

      <TouchableWithoutFeedback onPress={mapFacade.handleMapPress} accessible={false}>

        <MapView
          ref={(ref) => (mapRef.current = ref)}
          style={globalStyles.map}
          initialRegion={region}
          pitchEnabled={false}
          rotateEnabled={false}
          zoomEnabled={true}
          zoomControlEnabled={true}
        >

          {permissionGranted && userLocation && (
            <Marker
              coordinate={userLocation}
              title="Your Location"
              pinColor="green"
            />
          )}
          {/* Show either regular route or shuttle route based on mode */}
          {activeTab !== 'transit' ? (
            newRoute && <Polyline coordinates={newRoute} strokeColor="#186DEE" strokeWidth={5} />
          ) : (
            <Polyline
              coordinates={shuttlePolyline || []}
              strokeColor={brandColors.concordiaRed}
              strokeWidth={5}
              lineDashPattern={[10, 5]}
            />
          )}
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
          {mapFacade.renderBuildings(buildingsData, globalStyles, brandColors)}
          {renderShuttleMarkers(globalStyles, brandColors)}
        </MapView>
      </TouchableWithoutFeedback>
      <TouchableOpacity
        style={globalStyles.refreshButton}
        onPress={async () => {
          setIsRefreshing(true);
          await mapFacade.getUserLocation();
          setIsRefreshing(false);
        }}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={globalStyles.refreshButtonText}>My Location</Text>
        )}
      </TouchableOpacity>
      {/* Popup UI – rendered when buildingInfo is set and navigation hasn't started */}
      {buildingInfo && !isNavigationStarted && (
        <View style={globalStyles.buildingInfoContainer}>
          {startPoint && endPoint ? (
            <>
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
                onPress={() => mapFacade.fetchDirections("transit")}
                style={globalStyles.addButton}
              >
                <Text style={globalStyles.refreshButtonText}>
                  Start Navigation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => mapFacade.resetNavigation()}
                style={[globalStyles.addButton, { marginTop: 10, backgroundColor: "#555" }]}
              >
                <Text style={globalStyles.refreshButtonText}>
                  Reset
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
            <Text style={globalStyles.buildingNameText}>
              {buildingInfo.name}
            </Text>
              <Text style={globalStyles.openingHoursText}>{buildingInfo.openingHours}</Text>
              <Text style={globalStyles.addressText}>{buildingInfo.address}</Text>
              <View style={globalStyles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => mapFacade.handleBuildingSelection(buildingInfo, "start")}
                  style={[globalStyles.addButton, { marginRight: 10 }]}
                >
                  <Text style={globalStyles.refreshButtonText}>Set as Start</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => mapFacade.handleBuildingSelection(buildingInfo, "end")}
                  style={globalStyles.addButton}
                >
                  <Text style={globalStyles.refreshButtonText}>Set as Destination</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
