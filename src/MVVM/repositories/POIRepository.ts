import { POI, POICategory } from '@/MVVM/models/POI';
import { IPOIRepository } from "./Interfaces/IPOIRepository";
import { BaseRepository } from "./BaseRepository";
import axios from "axios";
import Constants from 'expo-constants';
import { generateId } from '@/Shared/utils/generalUtils';

// Export the interface for backward compatibility
export { IPOIRepository as POIRepository };

export class POIRepositoryImpl extends BaseRepository<POI> implements IPOIRepository {
  async getPOIById(poiId: string): Promise<POI> {
    // Implement actual fetch from data source
    throw new Error("Method not implemented: getPOIById");
  }
  
  async getPOIsInRadius(latitude: number, longitude: number, radiusInMeters: number): Promise<POI[]> {
    const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    try {
      const rawResults = await this.fetchNearbyRestaurants({ latitude, longitude }, radiusInMeters, apiKey);
      return rawResults.map(doc => this.mapToPOI(doc));
    } catch (error) {
      console.error("Error finding nearby POIs:", error);
      return [];
    }
  }
  
  async getPOIsByCategory(category: POICategory): Promise<POI[]> {
    // Implement actual fetch from data source
    throw new Error("Method not implemented: getPOIsByCategory");
  }
  
  async createPOI(poi: POI, userId: string): Promise<POI> {
    // Implement actual creation in data source
    throw new Error("Method not implemented: createPOI");
  }
  
  async updatePOI(poiId: string, updates: Partial<POI>, userId: string): Promise<POI> {
    // Implement actual update in data source
    throw new Error("Method not implemented: updatePOI");
  }
  
  async deletePOI(poiId: string, userId: string): Promise<boolean> {
    // Implement actual deletion in data source
    throw new Error("Method not implemented: deletePOI");
  }

  private async fetchNearbyRestaurants(
    location: { latitude: number; longitude: number },
    radius: number,
    apiKey: string
  ): Promise<any[]> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&type=restaurant&key=${apiKey}`;
      const response = await axios.get(url);
      return response.data.results;
    } catch (error) {
      console.error("Error fetching nearby restaurants:", error);
      return [];
    }
  }

  private mapToPOI(doc: any): POI {
    const now = new Date();
    
    // Determine category based on types
    let category;
    if (doc.types) {
      if (doc.types.includes("cafe")) {
        category = POICategory.CAFE;
      } else if (doc.types.includes("bar")) {
        category = POICategory.BAR;
      } else {
        category = POICategory.RESTAURANT;
      }
    }

    return {
      _id: doc.place_id || generateId(),
      type: doc.types ? doc.types[0] : undefined,
      name: doc.name,
      category: category,
      description: doc.vicinity,
      location: doc.geometry ? `${doc.geometry.location.lat},${doc.geometry.location.lng}` : undefined,
      createdAt: now,
      updatedAt: now
    };
  }
}
