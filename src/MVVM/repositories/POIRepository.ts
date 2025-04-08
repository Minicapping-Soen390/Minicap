import { POI, POICategory } from '@/MVVM/models/POI';
import { IPOIRepository } from "./Interfaces/IPOIRepository";
import axios from "axios";
import Constants from 'expo-constants';
import { generateId } from '@/Shared/utils/GeneralUtils';

// Google Place API result interface
interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  types?: string[];
  geometry?: {
    location: {
      lat: number;
      lng: number;
    }
  }
}

// Export the interface for backward compatibility
export { IPOIRepository as POIRepository };

export class POIRepositoryImpl implements IPOIRepository {
  // The single instance
  private static instance: POIRepositoryImpl | null = null;
  
  // Private constructor ensures singleton pattern
  private constructor() {
    // Initialize any resources needed
  }

  // Public static method to get the singleton instance
  public static getInstance(): POIRepositoryImpl {
    if (!POIRepositoryImpl.instance) {
      POIRepositoryImpl.instance = new POIRepositoryImpl();
    }
    return POIRepositoryImpl.instance;
  }

  async getPOIById(poiId: string): Promise<POI> {
    // Implementation to be completed
    throw new Error("Method not implemented: getPOIById");
  }
  
  async getPOIsInRadius(latitude: number, longitude: number, radiusInMeters: number): Promise<POI[]> {
    console.log(`[POIRepository] Fetching POIs at ${latitude},${longitude} with radius ${radiusInMeters}m`);
    const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error("[POIRepository] Google Maps API key not found");
      return [];
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusInMeters}&type=restaurant&key=${apiKey}`;
      console.log(`[POIRepository] Calling API: ${url.substring(0, url.indexOf('key=') + 5)}[API_KEY]`);
      
      const response = await axios.get(url);
      const results: GooglePlaceResult[] = response.data.results || [];
      
      console.log(`[POIRepository] Found ${results.length} POIs from API`);
      
      return results.map(place => this.mapToPOI(place));
    } catch (error) {
      console.error("[POIRepository] Error fetching POIs:", error);
      return [];
    }
  }
  
  async getPOIsByCategory(category: POICategory): Promise<POI[]> {
    // Implementation to be completed
    throw new Error("Method not implemented: getPOIsByCategory");
  }
  
  async createPOI(poi: POI, userId: string): Promise<POI> {
    // Implementation to be completed
    throw new Error("Method not implemented: createPOI");
  }
  
  async updatePOI(poiId: string, updates: Partial<POI>, userId: string): Promise<POI> {
    // Implementation to be completed
    throw new Error("Method not implemented: updatePOI");
  }
  
  async deletePOI(poiId: string, userId: string): Promise<boolean> {
    // Implementation to be completed
    throw new Error("Method not implemented: deletePOI");
  }

  private mapToPOI(place: GooglePlaceResult): POI {
    const now = new Date();
    
    // Determine category based on types
    let category = POICategory.RESTAURANT; // Default
    
    if (place.types) {
      if (place.types.includes("cafe")) {
        category = POICategory.CAFE;
      } else if (place.types.includes("bar")) {
        category = POICategory.BAR;
      }
    }

    return {
      id: place.place_id || generateId(),
      type: place.types ? place.types[0] : "restaurant",
      name: place.name || "Unknown Place",
      category: category,
      description: place.vicinity || "",
      location: place.geometry ? 
        `${place.geometry.location.lat},${place.geometry.location.lng}` : 
        "0,0", // Default to origin if no geometry
      createdAt: now,
      updatedAt: now
    };
  }
}
