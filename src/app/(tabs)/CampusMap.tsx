import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import MapView, { Marker, Polyline, Region, LatLng, Circle } from "react-native-maps";
import { SafeAreaView, Edge } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { globalStyles, mainEdges, brandColors } from "../styles/globalStyles";
import buildingsData from "@/data/hardcodedBuildings.json";
import campusCenters from "@/data/campusCenters.json";
import { POICategory } from "@/MVVM/models/POI";
import { Campus } from "@/MVVM/models/Campus";
import { 
  createMapFacade,
  createPOIMapFacade,
  createIndoorNavigationFacade,
  createMapUIFacade,
  renderPOIMarkers
} from "../../Shared/utils/mapUtils";
import {
  createShuttleFacade,
  renderShuttleMarkers,
} from "../../Shared/utils/shuttleUtils";
import IndoorNavigationModal from "../../components/IndoorNavigationModal";
import { getErrorMessage } from "@/Shared/utils/generalUtils";
 

/**
 * Props interface for CampusMap component
 */
interface CampusMapProps {
  campusId: string;
}

/**
 * Campus model for SGW campus
 */
const SGWCampus: Campus = {
  id: "sgw-uuid",
  name: "SGW Campus",
  outdoorLocation: "loc-sgw",
  buildingIds: [],
};

/**
 * Campus model for Loyola campus
 */
const LoyolaCampus: Campus = {
  id: "loyola-uuid",
  name: "Loyola Campus",
  outdoorLocation: "loc-loyola",
  buildingIds: [],
};

/**
 * Main component for displaying interactive campus map with navigation features
 * @param campusId - Unique identifier for the campus to display
 */
const CampusMap: React.FC<CampusMapProps> = ({ campusId }) => {
  const campus = campusId === SGWCampus.id ? SGWCampus : LoyolaCampus;
  const region: Region = campusCenters[campus.outdoorLocation as keyof typeof campusCenters];
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

  // POI states
  const [allPOIs, setAllPOIs] = useState<any[]>([]);
  const [filteredPOIs, setFilteredPOIs] = useState<any[]>([]);
  const [selectedPOICategory, setSelectedPOICategory] = useState<POICategory | 'all'>('all');
  const [showPOIFilters, setShowPOIFilters] = useState<boolean>(false);
  const [searchRadius, setSearchRadius] = useState<number>(500); // Default radius 500m
  
  // Indoor navigation state
  const [isIndoorNavVisible, setIsIndoorNavVisible] = useState<boolean>(false);
  const [currentFloorIndex, setCurrentFloorIndex] = useState<number>(0);

  // Cache for POI data to avoid repeated API calls
  const poiCache = useRef<Record<string, any[]>>({});

  // Create shuttle facade
  const shuttleFacade = createShuttleFacade({
    setShuttleLocations,
    setEstimatedWaitTime,
    setShuttlePolyline,
  });

  // Create map facade
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
    buildingInfo,
  });

  // Create POI facade
  const poiFacade = useMemo(
    () => createPOIMapFacade({
      setFilteredPOIs,
      setSelectedPOICategory,
      setSearchRadius,
      setShowPOIFilters,
      allPOIs,
      selectedPOICategory,
      searchRadius,
      showPOIFilters,
    }),
    [allPOIs, selectedPOICategory, searchRadius, showPOIFilters]
  );

  // Create indoor navigation facade
  const indoorNavFacade = useMemo(
    () => createIndoorNavigationFacade({
      setIsIndoorNavVisible,
      setCurrentFloorIndex,
      currentFloorIndex,
      buildingInfo,
      Alert,
    }),
    [buildingInfo, currentFloorIndex]
  );

  // Create UI facade
  const mapUIFacade = useMemo(
    () => createMapUIFacade({
      setIsFullScreenDirections,
      isFullScreenDirections,
      setIsRefreshing,
      getUserLocation: mapFacade.getUserLocation,
    }),
    [isFullScreenDirections]
  );

  // Get user location on component mount
  useEffect(() => {
    mapFacade.getUserLocation();
  }, []);

  // Animate to region when it changes
  useEffect(() => {
    if (mapRef.current) {
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

  // Fetch nearby POIs when userLocation is available or searchRadius changes
  useEffect(() => {
    if (!userLocation) return;

    // Skip POI search when radius is 0
    if (searchRadius === 0) {
      console.log("Search radius is 0m, not fetching POIs");
      setAllPOIs([]);
      setFilteredPOIs([]);
      return;
    }

    // Create a cache key based on location and radius
    const lat = userLocation.latitude.toFixed(4);
    const long = userLocation.longitude.toFixed(4);
    const cacheKey = `${lat}-${long}-${searchRadius}`;

    // Check if we have this data in cache
    if (poiCache.current[cacheKey]) {
      console.log("Using cached POI data");
      setAllPOIs(poiCache.current[cacheKey]);
      return;
    }

    // If not in cache, fetch from API
    console.log(`Fetching POIs at ${lat},${long} with radius: ${searchRadius}m`);
    poiFacade.findNearbyPOIs(userLocation.latitude, userLocation.longitude, searchRadius)
      .then((results: any[]) => {
        // Store in cache
        poiCache.current[cacheKey] = results;
        console.log(`Found ${results.length} POIs`);
        setAllPOIs(results);
      })
      .catch((error: unknown) => console.error("Error fetching POIs:", getErrorMessage(error)));
  }, [userLocation, searchRadius]);

  // Filter POIs when category or allPOIs changes
  useEffect(() => {
    poiFacade.filterPOIsByCategory();
  }, [selectedPOICategory, allPOIs]);

  return (
    <View
      style={globalStyles.mapContainer}
      testID="outdoor-navigation-container"
    >
      {locationError && (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>{locationError}</Text>
        </View>
      )}

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
            <>
              <Marker coordinate={userLocation} title="Your Location" pinColor="green" />
              {/* Search radius circle */}
              <Circle
                center={userLocation}
                radius={searchRadius}
                strokeWidth={1}
                strokeColor="rgba(0, 0, 255, 0.3)"
                fillColor="rgba(0, 0, 255, 0.1)"
              />
            </>
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
          
          {/* Render filtered POI markers */}
          {renderPOIMarkers(filteredPOIs, poiFacade.getMarkerColorForCategory)}
          
          {/* Render shuttle location markers */}
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

      {/* Filter Icon Button in the top right corner */}
      <TouchableOpacity
        style={globalStyles.filterIconButton}
        onPress={poiFacade.togglePOIFilters}
      >
        <Image
          source={require("../../assets/icons/Filter.png")}
          style={globalStyles.filterIcon}
        />
      </TouchableOpacity>

      {/* POI Filter Container */}
      {showPOIFilters && (
        <View style={globalStyles.filterContainer}>
          <Text style={globalStyles.filterTitle}>Filter POIs</Text>

          {/* Category Filter Section */}
          <Text style={globalStyles.filterSectionTitle}>Categories</Text>
          <View style={globalStyles.filterOptions}>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                selectedPOICategory === 'all' && globalStyles.activeFilterOption
              ]}
              onPress={() => poiFacade.handleCategoryChange('all')}
            >
              <Text style={[
                globalStyles.filterText,
                selectedPOICategory === 'all' && globalStyles.activeFilterText
              ]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                selectedPOICategory === POICategory.RESTAURANT && globalStyles.activeFilterOption
              ]}
              onPress={() => poiFacade.handleCategoryChange(POICategory.RESTAURANT)}
            >
              <Text style={[
                globalStyles.filterText,
                selectedPOICategory === POICategory.RESTAURANT && globalStyles.activeFilterText
              ]}>Restaurants</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                selectedPOICategory === POICategory.CAFE && globalStyles.activeFilterOption
              ]}
              onPress={() => poiFacade.handleCategoryChange(POICategory.CAFE)}
            >
              <Text style={[
                globalStyles.filterText,
                selectedPOICategory === POICategory.CAFE && globalStyles.activeFilterText
              ]}>Cafes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                selectedPOICategory === POICategory.BAR && globalStyles.activeFilterOption
              ]}
              onPress={() => poiFacade.handleCategoryChange(POICategory.BAR)}
            >
              <Text style={[
                globalStyles.filterText,
                selectedPOICategory === POICategory.BAR && globalStyles.activeFilterText
              ]}>Bars</Text>
            </TouchableOpacity>
          </View>

          {/* Radius Filter Section */}
          <Text style={globalStyles.filterSectionTitle}>Search Radius</Text>
          <View style={globalStyles.filterOptions}>
            {[0, 100, 200, 500, 1000].map((radius) => (
              <TouchableOpacity
                key={radius}
                style={[
                  globalStyles.filterOption,
                  searchRadius === radius && globalStyles.activeFilterOption
                ]}
                onPress={() => poiFacade.handleRadiusChange(radius)}
              >
                <Text style={[
                  globalStyles.filterText,
                  searchRadius === radius && globalStyles.activeFilterText
                ]}>{radius}m</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* POI Count Information */}
          <Text style={globalStyles.poiCountText}>
            {filteredPOIs.length} POI{filteredPOIs.length !== 1 ? 's' : ''} found within {searchRadius}m
          </Text>
        </View>
      )}

      {/* My Location Button */}
      <TouchableOpacity
        style={globalStyles.refreshButton}
        onPress={mapUIFacade.handleRefreshLocation}
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
            <RenderNavigationStartPopup 
              startPoint={startPoint}
              endPoint={endPoint}
              mapFacade={mapFacade} 
            />
          ) : (
            <RenderBuildingInfoPopup 
              buildingInfo={buildingInfo}
              mapFacade={mapFacade}
              handleIndoorNavigation={indoorNavFacade.handleIndoorNavigation} 
            />
          )}
        </View>
      )}

      {/* Indoor Navigation Modal */}
      {isIndoorNavVisible && buildingInfo && buildingInfo.floors && (
        <IndoorNavigationModal
          buildingInfo={buildingInfo}
          currentFloorIndex={currentFloorIndex}
          closeIndoorNavigation={indoorNavFacade.closeIndoorNavigation}
          changeFloor={indoorNavFacade.changeFloor}
        />
      )}

      {/* Navigation Directions Popup */}
      {isNavigationStarted && (
        <RenderNavigationDirections
          isFullScreenDirections={isFullScreenDirections}
          toggleFullScreenDirections={mapUIFacade.toggleFullScreenDirections}
          mapFacade={mapFacade}
          directions={directions}
          isCrossCampusNavigation={isCrossCampusNavigation}
          activeTab={activeTab}
          estimatedWaitTime={estimatedWaitTime}
          globalStyles={globalStyles}
        />
      )}
    </View>
  );
};

interface RenderBuildingInfoPopupProps {
  buildingInfo: any;
  mapFacade: any;
  handleIndoorNavigation: () => void;
}

const RenderBuildingInfoPopup: React.FC<RenderBuildingInfoPopupProps> = ({ 
  buildingInfo, 
  mapFacade, 
  handleIndoorNavigation 
}) => {
  return (
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
        style={[
          globalStyles.addButton,
          { marginTop: 10, backgroundColor: "green" },
        ]}
      >
        <Text style={globalStyles.refreshButtonText}>
          Indoor Navigation
        </Text>
      </TouchableOpacity>
    </>
  );
};

interface RenderNavigationStartPopupProps {
  startPoint: any;
  endPoint: any;
  mapFacade: any;
}

const RenderNavigationStartPopup: React.FC<RenderNavigationStartPopupProps> = ({
  startPoint,
  endPoint,
  mapFacade
}) => {
  return (
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
            Constants.expoConfig?.extra?.googleMapsApiKey ??
              process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
              ""
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
  );
};

interface RenderNavigationDirectionsProps {
  isFullScreenDirections: boolean;
  toggleFullScreenDirections: () => void;
  mapFacade: any;
  directions: any[];
  isCrossCampusNavigation: boolean;
  activeTab: string;
  estimatedWaitTime: number | null;
  globalStyles: any;
}

const RenderNavigationDirections: React.FC<RenderNavigationDirectionsProps> = ({
  isFullScreenDirections,
  toggleFullScreenDirections,
  mapFacade,
  directions,
  isCrossCampusNavigation,
  activeTab,
  estimatedWaitTime,
  globalStyles
}) => {
  return (
    <View
      style={[
        globalStyles.directionsContainer,
        isFullScreenDirections && globalStyles.fullScreenDirections,
      ]}
    >
      <TouchableOpacity onPress={toggleFullScreenDirections}>
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
            testID={mode}
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
  );
};

/**
 * Component that allows switching between SGW and Loyola campus views
 * Wraps the CampusMap component and handles campus selection state
 */
const CampusSwitcher: React.FC = () => {
  const [isSGWCampus, setIsSGWCampus] = useState(true);
  const currentCampusId = isSGWCampus ? SGWCampus.id : LoyolaCampus.id;

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

      <View style={globalStyles.mapContainer}>
        <CampusMap campusId={currentCampusId} />
      </View>
    </SafeAreaView>
  );
};

export default CampusSwitcher;