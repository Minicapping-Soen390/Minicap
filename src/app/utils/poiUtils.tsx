import axios from "axios";
import { POI, POICategory } from "@/models/POI";
import Constants from 'expo-constants';

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
  let category = POICategory.Restaurant; // Default

  if (doc.types) {
    if (doc.types.includes("cafe")) {
      category = POICategory.Cafe;
    } else if (doc.types.includes("bar")) {
      category = POICategory.Bar;
    }
  }

  return {
    id: doc.place_id || Math.random().toString(36).substring(7),
    name: doc.name,
    category: category,
    location: {
      latitude: doc.geometry.location.lat,
      longitude: doc.geometry.location.lng,
    },
    address: doc.vicinity,
  };
};

export const getMarkerColorForCategory = (category: POICategory): string => {
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

export const createPOIFacade = () => {
  // Internal cache of POIs to maintain state between calls
  let allPOIs: POI[] = [];

  let categoryFilters = {
    [POICategory.Restaurant]: true,
    [POICategory.Cafe]: true,
    [POICategory.Bar]: true
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
      return allPOIs.filter(poi => categoryFilters[poi.category] === true);
    },

    toggleCategoryFilter: (category: POICategory): POI[] => {
      categoryFilters[category] = !categoryFilters[category];
      return allPOIs.filter(poi => categoryFilters[poi.category] === true);
    },

    toggleAllFilters: (value: boolean): POI[] => {
      categoryFilters = {
        [POICategory.Restaurant]: value,
        [POICategory.Cafe]: value,
        [POICategory.Bar]: value
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
        [POICategory.Restaurant]: true,
        [POICategory.Cafe]: true,
        [POICategory.Bar]: true
      };
    }
  };
};