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
import { Campus } from "@/models/Campus";
import { createMapFacade } from "../utils/mapUtils";
import { createShuttleFacade, renderShuttleMarkers } from "../utils/shuttleUtils";
import { createPOIFacade, POIType } from "@/app/utils/poiUtils";
import { POICategory } from "@/models/POI";

interface CampusMapProps {
  campusId: string;
}

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
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [newRoute, setNewRoute] = useState<LatLng[] | null>(null);
  const [directions, setDirections] = useState<any[]>([]);
  const [destinationAddress, setDestinationAddress] = useState<string>("");
  const [startingAddress, setStartingAddress] = useState<string>("");
  const [isNavigationStarted, setIsNavigationStarted] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<any>(null);
  const [endPoint, setEndPoint] = useState<any>(null);

  // POI Navigation states
  const [selectedPOI, setSelectedPOI] = useState<POIType | null>(null);
  const [poiRouteStyle, setPoiRouteStyle] = useState({
    strokeColor: "#800080",
    strokeWidth: 4,
    lineDashPattern: [0]
  });

  // Shuttle states
  const [shuttleLocations, setShuttleLocations] = useState<any[]>([]);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null);
  const [shuttlePolyline, setShuttlePolyline] = useState<LatLng[] | null>(null);

  // Directions popup and Transport mode
  const [isFullScreenDirections, setIsFullScreenDirections] = useState<boolean>(false);
  const [isCrossCampusNavigation, setIsCrossCampusNavigation] = useState<boolean>(false);
  const [transportMode, setTransportMode] = useState<string>("walking");
  const [activeTab, setActiveTab] = useState<string>("walking");

  // POI states
  const [allPOIs, setAllPOIs] = useState<any[]>([]);
  const [filteredPOIs, setFilteredPOIs] = useState<any[]>([]);
  const [selectedPOICategory, setSelectedPOICategory] = useState<POICategory | 'all'>('all');
  const [showPOIFilters, setShowPOIFilters] = useState<boolean>(false);
  const [searchRadius, setSearchRadius] = useState<number>(500);

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

  const poiFacade = useMemo(() => createPOIFacade(), []);

  // Update route style when transport mode changes
  useEffect(() => {
    if (selectedPOI) {
      let style = {
        strokeColor: "#800080",
        strokeWidth: 4,
        lineDashPattern: [0]
      };
      
      if (transportMode === "walking") {
        style.lineDashPattern = [10, 5];
      } else if (transportMode === "bicycling") {
        style.strokeColor = "#00AA00";
      } else if (transportMode === "transit") {
        style.strokeColor = brandColors.concordiaRed;
      }

      setPoiRouteStyle(style);
    }
  }, [transportMode, selectedPOI]);

  useEffect(() => {
    mapFacade.getUserLocation();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [region]);

  const handlePOISelection = (poi: POIType) => {
    setSelectedPOI(poi);
    setBuildingInfo(null);
    setEndPoint({
      latitude: poi.location.latitude,
      longitude: poi.location.longitude,
      name: poi.name,
      address: poi.address
    });
    
    if (userLocation) {
      setStartPoint({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        name: "Your Location"
      });
      setIsNavigationStarted(true);
      mapFacade.fetchDirections(
        transportMode,
        Constants.expoConfig?.extra?.googleMapsApiKey ?? 
        process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? 
        "API_KEY"
      );
    } else {
      Alert.alert("Location Required", "Please enable location services to navigate to this POI");
    }
  };

  const resetPOINavigation = () => {
    setSelectedPOI(null);
    setNewRoute(null);
    setDirections([]);
    setIsNavigationStarted(false);
  };

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

  // Fetch nearby POIs
  useEffect(() => {
    if (userLocation) {
      const lat = userLocation.latitude.toFixed(4);
      const long = userLocation.longitude.toFixed(4);
      const cacheKey = `${lat}-${long}-${searchRadius}`;

      if (poiCache.current[cacheKey]) {
        setAllPOIs(poiCache.current[cacheKey]);
        return;
      }

      poiFacade
        .findNearbyPOIs(userLocation.latitude, userLocation.longitude, searchRadius)
        .then((results) => {
          poiCache.current[cacheKey] = results;
          setAllPOIs(results);
        })
        .catch((error) => console.error("Error fetching POIs:", error));
    }
  }, [userLocation, searchRadius]);

  // Filter POIs by category
  useEffect(() => {
    if (selectedPOICategory === 'all') {
      setFilteredPOIs(allPOIs);
    } else {
      const filtered = allPOIs.filter(poi => poi.category === selectedPOICategory);
      setFilteredPOIs(filtered);
    }
  }, [selectedPOICategory, allPOIs]);

  const getMarkerColorForCategory = (category: POICategory): string => {
    switch (category) {
      case POICategory.Restaurant: return "red";
      case POICategory.Cafe: return "orange";
      case POICategory.Bar: return "blue";
      default: return "purple";
    }
  };

  const handleCategoryChange = (category: POICategory | 'all') => {
    setSelectedPOICategory(category);
  };

  const handleRadiusChange = (radius: number) => {
    setSearchRadius(radius);
  };

  const togglePOIFilters = () => {
    setShowPOIFilters(!showPOIFilters);
  };

  const poiCache = useRef({});

  return (
    <View style={globalStyles.mapContainer} testID="outdoor-navigation-container">
      {locationError ? (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>{locationError}</Text>
        </View>
      ) : null}

      <TouchableWithoutFeedback onPress={mapFacade.handleMapPress} accessible={false}>
        <MapView
          testID="campus-map"
          ref={mapRef}
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
              <Circle
                center={userLocation}
                radius={searchRadius}
                strokeWidth={1}
                strokeColor="rgba(0, 0, 255, 0.3)"
                fillColor="rgba(0, 0, 255, 0.1)"
              />
            </>
          )}

          {/* Route rendering with POI-specific styling */}
          {selectedPOI && newRoute ? (
            <Polyline
              coordinates={newRoute}
              strokeColor={poiRouteStyle.strokeColor}
              strokeWidth={poiRouteStyle.strokeWidth}
              lineDashPattern={poiRouteStyle.lineDashPattern}
              testID="poi-route-polyline"
            />
          ) : activeTab !== "transit" ? (
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

          {/* POI Markers with navigation support */}
          {filteredPOIs.map((poi) => (
            <Marker
              key={poi.id}
              coordinate={{
                latitude: poi.location.latitude,
                longitude: poi.location.longitude,
              }}
              title={poi.name}
              description={poi.address}
              pinColor={getMarkerColorForCategory(poi.category)}
              onPress={() => handlePOISelection(poi)}
              testID={`poi-marker-${poi.id}`}
            />
          ))}

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
                  <Text style={[globalStyles.shuttleStopText, { fontSize: 35, color: brandColors.white }]}>
                    🚌
                  </Text>
                </View>
              </Marker>
            ))}
        </MapView>
      </TouchableWithoutFeedback>

      {/* Filter Icon Button */}
      <TouchableOpacity
        style={globalStyles.filterIconButton}
        onPress={togglePOIFilters}
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

          <Text style={globalStyles.filterSectionTitle}>Categories</Text>
          <View style={globalStyles.filterOptions}>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                selectedPOICategory === 'all' && globalStyles.activeFilterOption
              ]}
              onPress={() => handleCategoryChange('all')}
            >
              <Text style={[
                globalStyles.filterText,
                selectedPOICategory === 'all' && globalStyles.activeFilterText
              ]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                selectedPOICategory === POICategory.Restaurant && globalStyles.activeFilterOption
              ]}
              onPress={() => handleCategoryChange(POICategory.Restaurant)}
            >
              <Text style={[
                globalStyles.filterText,
                selectedPOICategory === POICategory.Restaurant && globalStyles.activeFilterText
              ]}>Restaurants</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                selectedPOICategory === POICategory.Cafe && globalStyles.activeFilterOption
              ]}
              onPress={() => handleCategoryChange(POICategory.Cafe)}
            >
              <Text style={[
                globalStyles.filterText,
                selectedPOICategory === POICategory.Cafe && globalStyles.activeFilterText
              ]}>Cafes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                selectedPOICategory === POICategory.Bar && globalStyles.activeFilterOption
              ]}
              onPress={() => handleCategoryChange(POICategory.Bar)}
            >
              <Text style={[
                globalStyles.filterText,
                selectedPOICategory === POICategory.Bar && globalStyles.activeFilterText
              ]}>Bars</Text>
            </TouchableOpacity>
          </View>

          <Text style={globalStyles.filterSectionTitle}>Search Radius</Text>
          <View style={globalStyles.filterOptions}>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                searchRadius === 0 && globalStyles.activeFilterOption
              ]}
              onPress={() => handleRadiusChange(0)}
            >
              <Text style={[
                globalStyles.filterText,
                searchRadius === 0 && globalStyles.activeFilterText
              ]}>0m</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                searchRadius === 100 && globalStyles.activeFilterOption
              ]}
              onPress={() => handleRadiusChange(100)}
            >
              <Text style={[
                globalStyles.filterText,
                searchRadius === 100 && globalStyles.activeFilterText
              ]}>100m</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                searchRadius === 200 && globalStyles.activeFilterOption
              ]}
              onPress={() => handleRadiusChange(200)}
            >
              <Text style={[
                globalStyles.filterText,
                searchRadius === 200 && globalStyles.activeFilterText
              ]}>200m</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                searchRadius === 500 && globalStyles.activeFilterOption
              ]}
              onPress={() => handleRadiusChange(500)}
            >
              <Text style={[
                globalStyles.filterText,
                searchRadius === 500 && globalStyles.activeFilterText
              ]}>500m</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                globalStyles.filterOption,
                searchRadius === 1000 && globalStyles.activeFilterOption
              ]}
              onPress={() => handleRadiusChange(1000)}
            >
              <Text style={[
                globalStyles.filterText,
                searchRadius === 1000 && globalStyles.activeFilterText
              ]}>1000m</Text>
            </TouchableOpacity>
          </View>

          <Text style={globalStyles.poiCountText}>
            {filteredPOIs.length} POI{filteredPOIs.length !== 1 ? 's' : ''} found within {searchRadius}m
          </Text>
        </View>
      )}

      {/* POI Navigation Info Panel */}
      {selectedPOI && isNavigationStarted && (
        <View style={globalStyles.buildingInfoContainer}>
          <Text style={globalStyles.buildingNameText}>{selectedPOI.name}</Text>
          <Text style={globalStyles.addressText}>{selectedPOI.address}</Text>
          <Text style={globalStyles.openingHoursText}>
            {selectedPOI.category} • {searchRadius}m away
          </Text>
          
          <TouchableOpacity
            onPress={resetPOINavigation}
            style={[globalStyles.addButton, { backgroundColor: "#555" }]}
            testID="reset-poi-navigation-button"
          >
            <Text style={globalStyles.refreshButtonText}>Cancel Navigation</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Building Info Popup */}
      {buildingInfo && !isNavigationStarted && (
        <View style={globalStyles.buildingInfoContainer}>
          {startPoint && endPoint ? (
            <>
              <Text style={globalStyles.buildingNameText}>Cross-Campus Navigation</Text>
              <Text style={globalStyles.addressText}>
                From: {startPoint.name} ({startPoint.campus})
              </Text>
              <Text style={globalStyles.addressText}>
                To: {endPoint.name} ({endPoint.campus})
              </Text>
              <TouchableOpacity
                onPress={() => {
                  mapFacade.fetchDirections(
                    "transit",
                    Constants.expoConfig?.extra?.googleMapsApiKey ??
                      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ??
                      "API_KEY"
                  );
                }}
                style={globalStyles.addButton}
                testID="start-navigation-button"
              >
                <Text style={globalStyles.refreshButtonText}>Start Navigation</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={mapFacade.resetNavigation}
                style={[globalStyles.addButton, { marginTop: 10, backgroundColor: "#555" }]}
                testID="reset-navigation-button"
              >
                <Text style={globalStyles.refreshButtonText}>Reset</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={globalStyles.buildingNameText}>{buildingInfo.name}</Text>
              <Text style={globalStyles.openingHoursText}>{buildingInfo.openingHours}</Text>
              <Text style={globalStyles.addressText}>{buildingInfo.address}</Text>
              <View style={globalStyles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => mapFacade.handleBuildingSelection(buildingInfo, "start")}
                  style={[globalStyles.addButton, { marginRight: 10 }]}
                  testID="set-start-button"
                >
                  <Text style={globalStyles.refreshButtonText}>Set as Start</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => mapFacade.handleBuildingSelection(buildingInfo, "end")}
                  style={globalStyles.addButton}
                  testID="set-destination-button"
                >
                  <Text style={globalStyles.refreshButtonText}>Set as Destination</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* Navigation Directions Popup */}
      {isNavigationStarted && (
        <View style={[
          globalStyles.directionsContainer,
          isFullScreenDirections && globalStyles.fullScreenDirections
        ]}>
          <TouchableOpacity onPress={() => setIsFullScreenDirections(!isFullScreenDirections)}>
            <Text style={globalStyles.fullScreenToggleText}>
              {isFullScreenDirections ? "Exit Full Screen" : "Full Screen"}
            </Text>
          </TouchableOpacity>

          <View style={globalStyles.directionsHeader}>
            <Text style={globalStyles.directionsTitle}>Directions</Text>
            <TouchableOpacity onPress={selectedPOI ? resetPOINavigation : mapFacade.resetNavigation}>
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
                onPress={() => mapFacade.handleTransportModeChange(mode === "shuttle" ? "transit" : mode)}
                style={[
                  globalStyles.modeTab,
                  activeTab === (mode === "shuttle" ? "transit" : mode) && globalStyles.activeModeTab,
                ]}
              >
                <Text style={
                  activeTab === (mode === "shuttle" ? "transit" : mode)
                    ? globalStyles.activeModeTabText
                    : globalStyles.modeTabText
                }>
                  {mode === "shuttle" ? "Shuttle Bus" : mode.charAt(0).toUpperCase() + mode.slice(1)}
                  {mode === "shuttle" && estimatedWaitTime ? ` (${estimatedWaitTime}min wait)` : ""}
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
                  <Text style={step.isShuttle ? globalStyles.shuttleInstruction : undefined}>
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
                      <Text testID="estimated-wait" style={globalStyles.shuttleScheduleText}>
                        ⏱️ Estimated wait: {step.departureInfo.waitTime} minutes
                      </Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text style={{ padding: 10, textAlign: "center" }}>Directions loading...</Text>
            )}
          </ScrollView>
        </View>
      )}

      <TouchableOpacity
        style={globalStyles.refreshButton}
        onPress={async () => {
          setIsRefreshing(true);
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
    </View>
  );
};

const CampusSwitcher: React.FC = () => {
  const [isSGWCampus, setIsSGWCampus] = useState(true);
  const currentCampusId = isSGWCampus ? SGWCampus._id : LoyolaCampus._id;

  return (
    <SafeAreaView style={globalStyles.container} edges={mainEdges as readonly Edge[]}>
      <View style={globalStyles.switchHeaderContainer}>
        <View style={globalStyles.campusSwitchHeader}>
          <View style={globalStyles.switchContainer}>
            <Text style={globalStyles.switchText}>SGW</Text>
            <Switch
              testID="campus-switch"
              value={!isSGWCampus}
              onValueChange={() => setIsSGWCampus(!isSGWCampus)}
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