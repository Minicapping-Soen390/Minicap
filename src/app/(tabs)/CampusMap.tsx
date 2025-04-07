//CampusMap.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
} from "react-native";
import MapView, { Marker, Polyline, Region, LatLng } from "react-native-maps";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { globalStyles, mainEdges, brandColors } from "../styles/globalStyles";
import buildingsData from "@/data/hardcodedBuildings.json";
import campusCenters from "@/data/campusCenters.json";
import { Campus } from "@/MVVM/models/Campus";
import { createMapFacade } from "../../Shared/utils/mapUtils";
import {
  createShuttleFacade,
  renderShuttleMarkers,
} from "../../Shared/utils/shuttleUtils";

// CampusMap Component Props
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

  // Core states
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Building selection and navigation states
  const [buildingInfo, setBuildingInfo] = useState<any>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null
  );
  const [newRoute, setNewRoute] = useState<LatLng[] | null>(null);
  const [directions, setDirections] = useState<any[]>([]);
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [startingAddress, setStartingAddress] = useState<string>("");
  const [isNavigationStarted, setIsNavigationStarted] =
    useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<any>(null);
  const [endPoint, setEndPoint] = useState<any>(null);

  // Shuttle states
  const [shuttleLocations, setShuttleLocations] = useState<any[]>([]);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(
    null
  );
  const [shuttlePolyline, setShuttlePolyline] = useState<LatLng[] | null>(null);

  // Directions popup and Transport mode
  const [isFullScreenDirections, setIsFullScreenDirections] =
    useState<boolean>(false);
  const [isCrossCampusNavigation, setIsCrossCampusNavigation] =
    useState<boolean>(false);
  const [transportMode, setTransportMode] = useState<string>("walking");
  const [activeTab, setActiveTab] = useState<string>("walking");

  // Indoor navigation state
  const [isIndoorNavVisible, setIsIndoorNavVisible] = useState<boolean>(false);
  const [currentFloorIndex, setCurrentFloorIndex] = useState<number>(0);

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
    endPoint,
    setShowNavigationPopup: () => {},
    setIsNavigationStarted,
    setNewRoute,
    setDirections,
    setShuttlePolyline,
    setTransportMode,
    setActiveTab,
    setIsCrossCampusNavigation,
    shuttleFacade,
  });

  useEffect(() => {
    console.log("Fetching user location...");
    mapFacade.getUserLocation();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      console.log("Animating to region:", region);
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [region]);

  // Dynamic Shuttle Tracking
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const trackShuttles = async () => {
      try {
        await shuttleFacade.trackShuttles(startPoint);
      } catch (error) {
        console.error("Error tracking shuttles:", error);
      }
    };

    // Start tracking if in cross-campus navigation and transit mode
    if (isCrossCampusNavigation && activeTab === "transit") {
      trackShuttles();
      intervalId = setInterval(trackShuttles, 15000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isCrossCampusNavigation, activeTab, startPoint]);
 
  const handleIndoorNavigation = () => {
    console.log("handleIndoorNavigation triggered");

    if (buildingInfo) {
      console.log("Building info found for:", buildingInfo.name);
      console.log("Floor info:", buildingInfo.floors);

      if (buildingInfo.floors && buildingInfo.floors.length > 0) {
        console.log(`Found ${buildingInfo.floors.length} floors for ${buildingInfo.name}.`);
        setCurrentFloorIndex(0); // Reset to first floor
        setIsIndoorNavVisible(true);
        console.log("Indoor navigation modal is now visible. Starting at floor 0.");
      } else {
        console.log("No floors data available for this building.");
        Alert.alert("No floor information available for this building.");
      }
    } else {
      console.log("No building info available.");
      Alert.alert("Building information is missing.");
    }
  };

  const closeIndoorNavigation = () => {
    console.log("Closing indoor navigation...");
    setIsIndoorNavVisible(false);
    console.log("Indoor navigation modal is now closed.");
  };

  const changeFloor = (direction: 'up' | 'down') => {
    console.log(`Change floor triggered: direction ${direction}, current floor index: ${currentFloorIndex}`);

    if (buildingInfo && buildingInfo.floors) {
      console.log(`Building ${buildingInfo.name} has ${buildingInfo.floors.length} floors.`);
      if (direction === 'up' && currentFloorIndex < buildingInfo.floors.length - 1) {
        console.log("Moving up to the next floor...");
        setCurrentFloorIndex(currentFloorIndex + 1);
        console.log(`Current floor index updated to: ${currentFloorIndex}`);
      } else if (direction === 'down' && currentFloorIndex > 0) {
        console.log("Moving down to the previous floor...");
        setCurrentFloorIndex(currentFloorIndex - 1);
        console.log(`Current floor index updated to: ${currentFloorIndex}`);
      } else {
        if (direction === 'up') {
          console.log("Already on the top floor.");
        } else {
          console.log("Already on the bottom floor.");
        }
      }
    } else {
      console.log("No floor data available.");
    }
  };

  return (
    <View
      style={globalStyles.mapContainer}
      testID="outdoor-navigation-container"
    >
      {locationError ? (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>{locationError}</Text>
        </View>
      ) : null}

      <TouchableWithoutFeedback
        onPress={mapFacade.handleMapPress}
        accessible={false}
      >
        <MapView
          testID="campus-map"
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
              testID="user-location-marker"
            />
          )}
          {activeTab !== "transit" ? (
            newRoute && (
              <Polyline
                coordinates={newRoute}
                strokeColor="#186DEE"
                strokeWidth={5}
                testID="outdoor-route-polyline"
              />
            )
          ) : (
            <Polyline
              coordinates={shuttlePolyline ?? []}
              strokeColor={brandColors.concordiaRed}
              strokeWidth={5}
              lineDashPattern={[10, 5]}
              testID="shuttle-route-polyline"
            />
          )}
          {buildingInfo && (
            <Marker
              testID="building-info"
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
          {isCrossCampusNavigation &&
            shuttleLocations &&
            shuttleLocations.length > 0 &&
            shuttleLocations.map((shuttle: any) => (
              <Marker
                key={shuttle.ID}
                coordinate={{
                  latitude: parseFloat(shuttle.Latitude),
                  longitude: parseFloat(shuttle.Longitude),
                }}
                title={`Shuttle ${shuttle.ID}`}
                testID={`shuttle-marker-${shuttle.ID}`}
              >
                <View style={[globalStyles.shuttleStopMarker]}>
                  <Text
                    style={[
                      globalStyles.shuttleStopText,
                      { fontSize: 35, color: brandColors.white },
                    ]}
                  >
                    🚌
                  </Text>
                </View>
              </Marker>
            ))}
        </MapView>
      </TouchableWithoutFeedback>

      <TouchableOpacity
        style={globalStyles.refreshButton}
        onPress={async () => {
          setIsRefreshing(true);
          console.log("Refreshing user location...");
          await mapFacade.getUserLocation();
          setIsRefreshing(false);
        }}
        disabled={isRefreshing}
        testID="refresh-location-button"
      >
        {isRefreshing ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={globalStyles.refreshButtonText}>My Location</Text>
        )}
      </TouchableOpacity>

      {/* Building Info Popup (when a building is selected but navigation hasn't started) */}
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
                onPress={() => {
                  console.log("Starting navigation...");
                  mapFacade.fetchDirections(
                    "transit",
                    Constants.expoConfig?.extra?.googleMapsApiKey ?? ""
                  );
                }}
                style={globalStyles.addButton}
                testID="start-navigation-button"
              >
                <Text style={globalStyles.refreshButtonText}>
                  Start Navigation
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  console.log("Resetting navigation...");
                  mapFacade.resetNavigation();
                }}
                style={[
                  globalStyles.addButton,
                  { marginTop: 10, backgroundColor: "#555" },
                ]}
                testID="reset-navigation-button"
              >
                <Text style={globalStyles.refreshButtonText}>Reset</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={globalStyles.buildingNameText}>
                {buildingInfo.name}
              </Text>
              <Text style={globalStyles.openingHoursText}>
                {buildingInfo.openingHours}
              </Text>
              <Text style={globalStyles.addressText}>
                {buildingInfo.address}
              </Text>
              <View style={globalStyles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => {
                    console.log(`Setting ${buildingInfo.name} as start point`);
                    mapFacade.handleBuildingSelection(buildingInfo, "start");
                  }}
                  style={[globalStyles.addButton, { marginRight: 10 }]}
                  testID="set-start-button"
                >
                  <Text style={globalStyles.refreshButtonText}>
                    Set as Start
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    console.log(`Setting ${buildingInfo.name} as destination`);
                    mapFacade.handleBuildingSelection(buildingInfo, "end");
                  }}
                  style={globalStyles.addButton}
                  testID="set-destination-button"
                >
                  <Text style={globalStyles.refreshButtonText}>
                    Set as Destination
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Indoor Navigation button */}
              <TouchableOpacity
                onPress={handleIndoorNavigation}
                style={[globalStyles.addButton, { marginTop: 10, backgroundColor: "green" }]} // Nice color for the button
              >
                <Text style={globalStyles.refreshButtonText}>Indoor Navigation</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}


      {/* Indoor Navigation Modal */}
      {isIndoorNavVisible && buildingInfo && buildingInfo.floors && (
        <IndoorNavigationModal
          buildingInfo={buildingInfo}
          currentFloorIndex={currentFloorIndex}
          closeIndoorNavigation={closeIndoorNavigation}
          changeFloor={changeFloor}
        />
      )}

      {/* Navigation Directions Popup now rendered even if directions are not available */}
      {isNavigationStarted && (
        <View
          style={[
            globalStyles.directionsContainer,
            isFullScreenDirections && globalStyles.fullScreenDirections,
          ]}
        >
          <TouchableOpacity
            onPress={() => setIsFullScreenDirections(!isFullScreenDirections)}
          >
            <Text style={globalStyles.fullScreenToggleText}>
              {isFullScreenDirections ? "Exit Full Screen" : "Full Screen"}
            </Text>
          </TouchableOpacity>

          <View style={globalStyles.directionsHeader}>
            <Text style={globalStyles.directionsTitle}>Directions</Text>
            <TouchableOpacity
              onPress={mapFacade.resetNavigation}
              style={globalStyles.cancelButton}
            >
              <Text style={globalStyles.cancelButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={globalStyles.transportModes}>
            {(isCrossCampusNavigation
              ? ["shuttle", "walking", "driving", "bicycling"]
              : ["walking", "driving", "transit", "bicycling"]
            ).map((mode) => (
              <TouchableOpacity
                key={mode}
                testID={`mode-tab-${mode}`}
                onPress={() =>
                  mapFacade.handleTransportModeChange(
                    mode === "shuttle" ? "transit" : mode
                  )
                }
                style={[
                  globalStyles.modeTab,
                  activeTab === (mode === "shuttle" ? "transit" : mode) &&
                    globalStyles.activeModeTab,
                ]}
              >
                <Text
                  style={
                    activeTab === (mode === "shuttle" ? "transit" : mode)
                      ? globalStyles.activeModeTabText
                      : globalStyles.modeTabText
                  }
                >
                  {mode === "shuttle"
                    ? "Shuttle Bus"
                    : mode.charAt(0).toUpperCase() + mode.slice(1)}
                  {mode === "shuttle" && estimatedWaitTime
                    ? ` (${estimatedWaitTime}min wait)`
                    : ""}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={globalStyles.directionsScroll}>
            {directions.length > 0 ? (
              directions.map((step, index) => (
                <View
                  key={index}
                  style={[
                    globalStyles.directionStep,
                    step.isShuttle && globalStyles.shuttleDirectionStep,
                  ]}
                >
                  <Text
                    style={
                      step.isShuttle
                        ? globalStyles.shuttleInstruction
                        : undefined
                    }
                  >
                    {step.instruction}
                  </Text>
                  <Text>
                    {step.distance} | {step.duration}
                  </Text>
                  {step.isShuttle && step.departureInfo && (
                    <View style={globalStyles.shuttleInfo}>
                      <Text style={globalStyles.shuttleScheduleText}>
                        🕒 Next departure: {step.departureInfo.departureTime}
                      </Text>
                      <Text
                        testID="estimated-wait"
                        style={globalStyles.shuttleScheduleText}
                      >
                        ⏱️ Estimated wait: {step.departureInfo.waitTime} minutes
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={{ padding: 10, textAlign: "center" }}>
                Directions loading...
              </Text>
            )}
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
    >
      <View style={globalStyles.switchHeaderContainer}>
        <View style={globalStyles.campusSwitchHeader}>
          <View style={globalStyles.switchContainer}>
            <Text style={globalStyles.switchText}>SGW</Text>
            <Switch
              testID="campus-switch"
              value={!isSGWCampus}
              onValueChange={() => {
                console.log("Switching campus...");
                setIsSGWCampus(!isSGWCampus);
              }}
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
