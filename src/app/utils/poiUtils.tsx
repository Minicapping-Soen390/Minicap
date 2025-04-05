import axios from "axios";
import { POI, POICategory } from "@/models/POI";

/**
 * Fetch nearby restaurants using the Google Places API.
 * @param location Object with latitude and longitude.
 * @param radius Search radius in meters.
 * @param apiKey Your Google Places API key.
 * @returns A promise that resolves to an array of raw restaurant results.
 */
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

/**
 * Maps a raw Google Places result to our POI model
 */
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

/**
 * Get marker color based on POI category
 */
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

/**
 * Creates a POI façade that directly handles POI data without using a ViewModel
 */
export const createPOIFacade = () => {
  // Internal cache of POIs to maintain state between calls
  let allPOIs: POI[] = [];

  // Default filter state
  let categoryFilters = {
    [POICategory.Restaurant]: true,
    [POICategory.Cafe]: true,
    [POICategory.Bar]: true
  };

  return {
    /**
     * Find nearby POIs based on location and radius
     */
    findNearbyPOIs: async (
      latitude: number,
      longitude: number,
      radius: number
    ): Promise<POI[]> => {
      try {
        // Get the API key from configuration or environment variables
        const apiKey = process.env.GOOGLE_PLACES_API_KEY || "AIzaSyCdMpoRN-cWcG-LGTKplqHs3SvTeYy7t0E";

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

    /**
     * Get the current list of all POIs
     */
    getAllPOIs: (): POI[] => {
      return allPOIs;
    },

    /**
     * Get filtered POIs based on current category filters
     */
    getFilteredPOIs: (): POI[] => {
      return allPOIs.filter(poi => categoryFilters[poi.category] === true);
    },

    /**
     * Update a single category filter
     */
    toggleCategoryFilter: (category: POICategory): POI[] => {
      categoryFilters[category] = !categoryFilters[category];
      return allPOIs.filter(poi => categoryFilters[poi.category] === true);
    },

    /**
     * Update all category filters at once
     */
    toggleAllFilters: (value: boolean): POI[] => {
      categoryFilters = {
        [POICategory.Restaurant]: value,
        [POICategory.Cafe]: value,
        [POICategory.Bar]: value
      };
      return value ? [...allPOIs] : [];
    },

    /**
     * Get current filter states
     */
    getCategoryFilters: () => {
      return { ...categoryFilters };
    },

    /**
     * Check if all filters are active
     */
    areAllFiltersActive: (): boolean => {
      return Object.values(categoryFilters).every(value => value === true);
    },

    /**
     * Check if any filters are active
     */
    areAnyFiltersActive: (): boolean => {
      return Object.values(categoryFilters).some(value => value === true);
    },

    /**
     * Clean up function
     */
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