import { POI, POICategory } from "@/MVVM/models/POI";
import { POIViewModel } from "@/MVVM/viewmodels/POIViewModel";

/**
 * Creates a facade for POI operations
 * Each call creates a fresh instance with its own viewmodel
 */
export const createPOIFacade = () => {
  // Create a fresh viewmodel instance for each facade
  const poiViewModel = new POIViewModel();
  
  return {
    findNearbyPOIs: async (
      latitude: number,
      longitude: number,
      radius: number
    ): Promise<POI[]> => {
      return poiViewModel.findNearbyPOIs(latitude, longitude, radius);
    },

    getAllPOIs: (): POI[] => {
      return poiViewModel.pois;
    },

    getFilteredPOIs: (): POI[] => {
      return poiViewModel.getFilteredPOIs();
    },

    toggleCategoryFilter: (category: POICategory): POI[] => {
      return poiViewModel.toggleCategoryFilter(category);
    },

    toggleAllFilters: (value: boolean): POI[] => {
      return poiViewModel.toggleAllFilters(value);
    },

    getCategoryFilters: () => {
      return poiViewModel.getCategoryFilters();
    },

    areAllFiltersActive: (): boolean => {
      return poiViewModel.areAllFiltersActive();
    },

    areAnyFiltersActive: (): boolean => {
      return poiViewModel.areAnyFiltersActive();
    },

    dispose: () => {
      poiViewModel.dispose();
    },

    getPOIForDisplay: (poiId: string): Promise<POI | null> => {
      return poiViewModel.findPOIById(poiId);
    }
  };
};

/**
 * Creates a facade for POI-related operations on the map.
 * Each call creates a fresh instance with its own viewmodel
 * @param params - Object containing state setters and current state values for POIs
 * @returns Object containing POI utility functions
 */
export const createPOIMapFacade = (params: {
  setFilteredPOIs: (pois: any[]) => void;
  setSelectedPOICategory: (category: POICategory | 'all') => void;
  setSearchRadius: (radius: number) => void;
  setShowPOIFilters: (show: boolean) => void;
  allPOIs: any[];
  selectedPOICategory: POICategory | 'all';
  searchRadius: number;
  showPOIFilters: boolean;
}) => {
  // Create a fresh viewmodel instance for each map facade
  const poiViewModel = new POIViewModel();
  
  return {
    filterPOIsByCategory: () => {
      poiViewModel.setPOIs(params.allPOIs);

      if (params.selectedPOICategory === 'all') {
        params.setFilteredPOIs(params.allPOIs);
      } else {
        const filtered = poiViewModel.filterPOIsByCategory(params.selectedPOICategory);
        params.setFilteredPOIs(filtered);
      }
    },

    findNearbyPOIs: async (latitude: number, longitude: number, radius: number): Promise<POI[]> => {
      return poiViewModel.findNearbyPOIs(latitude, longitude, radius);
    },

    handleCategoryChange: (category: POICategory | 'all') => {
      params.setSelectedPOICategory(category);
    },

    handleRadiusChange: (radius: number) => {
      params.setSearchRadius(radius);
    },

    togglePOIFilters: () => {
      params.setShowPOIFilters(!params.showPOIFilters);
    },

    getMarkerColorForCategory: (category: POICategory): string => {
      return poiViewModel.getMarkerColorForCategory(category);
    }
  };
};

/**
 * Renders POI markers on the map.
 * @param filteredPOIs - Array of POIs to render
 * @param getMarkerColorForCategory - Function to determine marker color
 * @returns Array of React elements representing POI markers
 */
export const renderPOIMarkers = (
  filteredPOIs: any[],
  getMarkerColorForCategory: (category: POICategory) => string,
  handleSelection: Function
) => {
  const { Marker } = require("react-native-maps");
  return filteredPOIs.map((poi) => (
    <Marker
      key={poi.id || `poi-${Math.random()}`}
      coordinate={{
        latitude: typeof poi.location === 'string'
          ? parseFloat(poi.location.split(',')[0])
          : poi.location.latitude,
        longitude: typeof poi.location === 'string'
          ? parseFloat(poi.location.split(',')[1])
          : poi.location.longitude,
      }}
      title={poi.name}
      description={poi.address || poi.description}
      pinColor={getMarkerColorForCategory(poi.category)}
    />
  ));
};

export default createPOIFacade;