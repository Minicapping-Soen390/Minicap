import axios from "axios";
import { POI, POICategory } from "@/MVVM/models/POI";
import Constants from 'expo-constants';
import { generateId } from "./generalUtils";

export const fetchNearbyRestaurants = async (
  location: { latitude: number; longitude: number },
  radius: number,
  apiKey: string
): Promise<any[]> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&type=restaurant&key=${apiKey}`;
    const response = await axios.get(url);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching nearby restaurants:", error);
    return [];
  }
};

const mapToPOI = (doc: any): POI => {
  // Determine category based on types
  let category = POICategory.RESTAURANT; // Default

  if (doc.types) {
    if (doc.types.includes("cafe")) {
      category = POICategory.CAFE;
    } else if (doc.types.includes("bar")) {
      category = POICategory.BAR;
    }
  }

  // Create a POI object that follows the POI interface
  return {
    _id: doc.place_id || generateId,
    type: doc.types ? doc.types[0] : "place",
    name: doc.name,
    category: category,
    description: doc.vicinity || "",
    location: `${doc.geometry.location.lat},${doc.geometry.location.lng}`,

  };
};

export const getMarkerColorForCategory = (category: POICategory): string => {
  switch (category) {
    case POICategory.RESTAURANT:
      return "red";
    case POICategory.CAFE:
      return "orange";
    case POICategory.BAR:
      return "blue";
    case POICategory.BATHROOM:
      return "green";
    case POICategory.LIBRARY:
      return "yellow";
    default:
      return "purple";
  }
};

export const createPOIFacade = () => {
  // Internal cache of POIs to maintain state between calls
  let allPOIs: POI[] = [];

  let categoryFilters = {
    [POICategory.RESTAURANT]: true,
    [POICategory.CAFE]: true,
    [POICategory.BAR]: true,
    [POICategory.BATHROOM]: true,
    [POICategory.LIBRARY]: true
  };

  // Helper function to extract coordinates from location string
  const getCoordinates = (location: string) => {
    const [lat, lng] = location.split(',').map(Number);
    return { latitude: lat, longitude: lng };
  };

  return {
    findNearbyPOIs: async (
      latitude: number,
      longitude: number,
      radius: number
    ): Promise<POI[]> => {
      try {
        const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY

        // Fetch the raw restaurant data
        const rawResults = await fetchNearbyRestaurants(
          { latitude, longitude },
          radius,
          apiKey
        );

        // Map each raw result to a POI
        allPOIs = rawResults.map(mapToPOI);
        return allPOIs;
      } catch (error) {
        console.error("Error finding nearby POIs:", error);
        return [];
      }
    },

    getAllPOIs: (): POI[] => {
      return allPOIs;
    },

    getFilteredPOIs: (): POI[] => {
      return allPOIs.filter(poi => poi.category && categoryFilters[poi.category] === true);
    },

    toggleCategoryFilter: (category: POICategory): POI[] => {
      categoryFilters[category] = !categoryFilters[category];
      return allPOIs.filter(poi => poi.category && categoryFilters[poi.category] === true);
    },

    toggleAllFilters: (value: boolean): POI[] => {
      categoryFilters = {
        [POICategory.RESTAURANT]: value,
        [POICategory.CAFE]: value,
        [POICategory.BAR]: value,
        [POICategory.BATHROOM]: value,
        [POICategory.LIBRARY]: value
      };
      return value ? [...allPOIs] : [];
    },

    getCategoryFilters: () => {
      return { ...categoryFilters };
    },

    areAllFiltersActive: (): boolean => {
      return Object.values(categoryFilters).every(value => value === true);
    },

    areAnyFiltersActive: (): boolean => {
      return Object.values(categoryFilters).some(value => value === true);
    },

    dispose: () => {
      allPOIs = [];
      categoryFilters = {
        [POICategory.RESTAURANT]: true,
        [POICategory.CAFE]: true,
        [POICategory.BAR]: true,
        [POICategory.BATHROOM]: true,
        [POICategory.LIBRARY]: true
      };
    },

    // Add a utility function to get POIs displayed on the map
    getPOIForDisplay: (poiId: string): POI | undefined => {
      return allPOIs.find(poi => poi._id === poiId);
    }
  };
};