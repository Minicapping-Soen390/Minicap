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
  const [searchRadius, setSearchRadius] = useState<number>(500); // Default radius 500m

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

  // Memoize the POI façade so it's only created once
  const poiFacade = useMemo(() => createPOIFacade(), []);

  useEffect(() => {
    mapFacade.getUserLocation();
  }, []);

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

  // Fetch nearby POIs when userLocation is available or when searchRadius changes
  useEffect(() => {
    if (userLocation) {
      poiFacade
        .findNearbyPOIs(userLocation.latitude, userLocation.longitude, searchRadius)
        .then((results) => {
          console.log(`Nearby POIs within ${searchRadius}m:`, results);
          setAllPOIs(results);
          setFilteredPOIs(results); // Initially show all POIs
        })
        .catch((error) => console.error("Error fetching POIs:", error));
    }
  }, [userLocation, searchRadius]);

  // Filter POIs when category changes
  useEffect(() => {
    if (selectedPOICategory === 'all') {
      setFilteredPOIs(allPOIs);
    } else {
      const filtered = allPOIs.filter(poi => poi.category === selectedPOICategory);
      setFilteredPOIs(filtered);
    }
  }, [selectedPOICategory, allPOIs]);

  // Function to handle POI category filter change
  const handleCategoryChange = (category: POICategory | 'all') => {
    setSelectedPOICategory(category);
  };

  // Function to handle search radius change
  const handleRadiusChange = (radius: number) => {
    setSearchRadius(radius);
  };

  // Function to get marker color based on POI category
  const getMarkerColorForCategory = (category: POICategory): string => {
    switch (category) {
      case POICategory.Restaurant:
        return "red";
      case POICategory.Cafe:
        return "orange";
      case POICategory.Bar:
        return "blue";
      default:
        return "purple";
    }
  };

  // Toggle POI filters visibility
  const togglePOIFilters = () => {
    setShowPOIFilters(!showPOIFilters);
  };

  return (
    <View style={globalStyles.mapContainer}>
      {locationError && (
        <View style={globalStyles.errorContainer}>
          <Text style={globalStyles.errorText}>{locationError}</Text>
        </View>
      )}

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

          {/* Render filtered POI markers */}
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
            />
          ))}
        </MapView>
      </TouchableWithoutFeedback>

      {/* Filter Icon Button in the top right corner */}
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

          {/* Category Filter Section */}
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

          {/* Radius Filter Section */}
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
          </View>

          {/* POI Count Information */}
          <Text style={globalStyles.poiCountText}>
            {filteredPOIs.length} POI{filteredPOIs.length !== 1 ? 's' : ''} found within {searchRadius}m
          </Text>
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
              <Text style={globalStyles.buildingNameText}>Cross-Campus Navigation</Text>
              <Text style={globalStyles.addressText}>
                From: {startPoint.name} ({startPoint.campus})
              </Text>
              <Text style={globalStyles.addressText}>
                To: {endPoint.name} ({endPoint.campus})
              </Text>
              <TouchableOpacity
                onPress={() => {
                  console.log("Starting navigation...");
                  mapFacade.fetchDirections("transit", Constants.expoConfig?.extra?.googleMapsApiKey || "");
                }}
                style={globalStyles.addButton}
              >
                <Text style={globalStyles.refreshButtonText}>Start Navigation</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  console.log("Resetting navigation...");
                  mapFacade.resetNavigation();
                }}
                style={[globalStyles.addButton, { marginTop: 10, backgroundColor: "#555" }]}
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
                  onPress={() => {
                    console.log(`Setting ${buildingInfo.name} as start point`);
                    mapFacade.handleBuildingSelection(buildingInfo, "start");
                  }}
                  style={[globalStyles.addButton, { marginRight: 10 }]}
                >
                  <Text style={globalStyles.refreshButtonText}>Set as Start</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    console.log(`Setting ${buildingInfo.name} as destination`);
                    mapFacade.handleBuildingSelection(buildingInfo, "end");
                  }}
                  style={globalStyles.addButton}
                >
                  <Text style={globalStyles.refreshButtonText}>Set as Destination</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* Navigation Directions Popup now rendered even if directions are not available */}
      {(isNavigationStarted) && (
        <View
          style={[
            globalStyles.directionsContainer,
            isFullScreenDirections && globalStyles.fullScreenDirections,
          ]}
        >
          <TouchableOpacity onPress={() => setIsFullScreenDirections(!isFullScreenDirections)}>
            <Text style={globalStyles.fullScreenToggleText}>
              {isFullScreenDirections ? "Exit Full Screen" : "Full Screen"}
            </Text>
          </TouchableOpacity>

          <View style={globalStyles.directionsHeader}>
            <Text style={globalStyles.directionsTitle}>Directions</Text>
            <TouchableOpacity onPress={mapFacade.resetNavigation} style={globalStyles.cancelButton}>
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
                onPress={() => mapFacade.handleTransportModeChange(mode === "shuttle" ? "transit" : mode)}
                style={[
                  globalStyles.modeTab,
                  activeTab === (mode === "shuttle" ? "transit" : mode) && globalStyles.activeModeTab,
                ]}
              >
                <Text
                  style={
                    activeTab === (mode === "shuttle" ? "transit" : mode)
                      ? globalStyles.activeModeTabText
                      : globalStyles.modeTabText
                  }
                >
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
                      <Text style={globalStyles.shuttleScheduleText}>
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