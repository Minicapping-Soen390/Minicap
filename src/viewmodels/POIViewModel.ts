import { runInAction } from 'mobx';
import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { POI, POICategory } from "@/models/POI";
import { MapRepository } from "@/repositories/POIRepository";
import { fetchNearbyRestaurants } from "@/app/utils/RestaurantService";
import uuid from 'react-native-uuid';
import Constants from 'expo-constants';

export class POIViewModel extends BaseViewModel<POI> implements MapRepository {
  private readonly COLLECTION_NAME = "pois";
  pois: POI[] = [];

  constructor() {
    super();
    this.pois = [];
  }

  async findPOIById(_id: string): Promise<POI> {
    this.assertNotDisposed();
    throw new Error("NotImplementedError: Operation not implemented");
  }

  async getAllPOIs(): Promise<POI[]> {
    this.assertNotDisposed();
    throw new Error("NotImplementedError: Operation not implemented");
  }

  async findPOIsByCategory(category: POICategory): Promise<POI[]> {
    this.assertNotDisposed();
    throw new Error("NotImplementedError: Operation not implemented");
  }

  async findNearbyPOIs(latitude: number, longitude: number, radius: number): Promise<POI[]> {
    this.assertNotDisposed();
    const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY

    try {
      const rawResults = await fetchNearbyRestaurants({ latitude, longitude }, radius, apiKey);
      const mappedPOIs = rawResults.map(doc => this.mapToDTO(doc));

      runInAction(() => {
        this.pois = mappedPOIs;
      });

      return mappedPOIs;
    } catch (error) {
      console.error("Error finding nearby POIs:", error);
      return [];
    }
  }

  protected mapToDTO(doc: any): POI {
    return {
      id: doc.place_id || uuid.v4(),
      name: doc.name,
      category: POICategory.Restaurant,
      location: {
        latitude: doc.geometry.location.lat,
        longitude: doc.geometry.location.lng,
      },
      address: doc.vicinity,
    };
  }
}