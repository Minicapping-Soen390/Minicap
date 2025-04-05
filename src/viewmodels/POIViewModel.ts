import { runInAction } from 'mobx';
import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { POI, POICategory } from "@/models/POI";
import { MapRepository } from "@/repositories/POIRepository";
import { fetchNearbyRestaurants } from "@/app/utils/RestaurantService";
import uuid from 'react-native-uuid';

export class POIViewModel extends BaseViewModel<POI> implements MapRepository {
  private readonly COLLECTION_NAME = "pois";
  // Define pois without makeAutoObservable
  pois: POI[] = [];

  constructor() {
    super();
    // Initialize the observable state - but don't call makeAutoObservable again
    this.pois = [];
    // No makeAutoObservable or makeObservable call here
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
    // Get the API key from configuration or environment variables
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || "AIzaSyCdMpoRN-cWcG-LGTKplqHs3SvTeYy7t0E";

    try {
      // Fetch the raw restaurant data
      const rawResults = await fetchNearbyRestaurants({ latitude, longitude }, radius, apiKey);

      // Map each raw result to a POI using mapToDTO
      const mappedPOIs = rawResults.map(doc => this.mapToDTO(doc));

      // Use runInAction to update our observable state
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