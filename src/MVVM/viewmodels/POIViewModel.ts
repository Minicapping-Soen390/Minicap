import { runInAction, makeAutoObservable } from 'mobx';
import { POI, POICategory } from '@/MVVM/models/POI';
import { BaseViewModel } from './BaseViewModel';
import { POIRepositoryImpl } from '@/MVVM/repositories/POIRepository';
import { generateId } from '@/Shared/utils/GeneralUtils';
import axios from "axios";
import Constants from 'expo-constants';

export class POIViewModel extends BaseViewModel<POI> {
  pois: POI[] = [];
  private readonly poiRepository: POIRepositoryImpl;
  
  private categoryFilters = {
    [POICategory.RESTAURANT]: true,
    [POICategory.CAFE]: true,
    [POICategory.BAR]: true,
    [POICategory.BATHROOM]: true,
    [POICategory.LIBRARY]: true
  };

  constructor() {
    super();
    // Get repository singleton instance
    this.poiRepository = POIRepositoryImpl.getInstance();
    makeAutoObservable(this);
  }

  async findPOIById(id: string): Promise<POI | null> {
    this.assertNotDisposed();
    try {
      return await this.poiRepository.getPOIById(id);
    } catch (error) {
      console.error("Error finding POI by ID:", error);
      return null;
    }
  }

  async getAllPOIs(): Promise<POI[]> {
    this.assertNotDisposed();
    try {
      // Since repository doesn't have a method to get all POIs, we're returning cached POIs
      // This should be updated when repository implements the appropriate method
      return this.pois;
    } catch (error) {
      console.error("Error getting all POIs:", error);
      return [];
    }
  }

  getFilteredPOIs(): POI[] {
    return this.pois.filter(poi => poi.category && this.categoryFilters[poi.category] === true);
  }

  toggleCategoryFilter(category: POICategory): POI[] {
    this.categoryFilters[category] = !this.categoryFilters[category];
    return this.getFilteredPOIs();
  }

  toggleAllFilters(value: boolean): POI[] {
    this.categoryFilters = {
      [POICategory.RESTAURANT]: value,
      [POICategory.CAFE]: value,
      [POICategory.BAR]: value,
      [POICategory.BATHROOM]: value,
      [POICategory.LIBRARY]: value
    };
    return value ? [...this.pois] : [];
  }

  getCategoryFilters() {
    return { ...this.categoryFilters };
  }

  areAllFiltersActive(): boolean {
    return Object.values(this.categoryFilters).every(value => value === true);
  }

  areAnyFiltersActive(): boolean {
    return Object.values(this.categoryFilters).some(value => value === true);
  }

  filterPOIsByCategory(category: POICategory | 'all'): POI[] {
    if (category === 'all') {
      return this.pois;
    } else {
      return this.pois.filter(poi => poi.category === category);
    }
  }

  async findPOIsByCategory(category: POICategory): Promise<POI[]> {
    this.assertNotDisposed();
    try {
      const pois = await this.poiRepository.getPOIsByCategory(category);
      runInAction(() => {
        // Filter the existing POIs or update if necessary
        this.pois = this.pois.filter(p => p.category !== category).concat(pois);
      });
      return pois;
    } catch (error) {
      console.error("Error finding POIs by category:", error);
      return [];
    }
  }

  async findNearbyPOIs(latitude: number, longitude: number, radius: number): Promise<POI[]> {
    this.assertNotDisposed();
    try {
      const pois = await this.poiRepository.getPOIsInRadius(latitude, longitude, radius);
      
      runInAction(() => {
        this.pois = pois;
      });

      return pois;
    } catch (error) {
      console.error("Error finding nearby POIs:", error);
      return [];
    }
  }

  async fetchNearbyRestaurants(
    location: { latitude: number; longitude: number },
    radius: number
  ): Promise<any[]> {
    try {
      const apiKey = Constants.expoConfig?.extra?.googleMapsApiKey || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.latitude},${location.longitude}&radius=${radius}&type=restaurant&key=${apiKey}`;
      const response = await axios.get(url);
      return response.data.results;
    } catch (error) {
      console.error("Error fetching nearby restaurants:", error);
      return [];
    }
  }

  getMarkerColorForCategory(category: POICategory): string {
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
  }

  protected mapToPOI(doc: any): POI {
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
      id: doc.placeid || generateId(),
      type: doc.types ? doc.types[0] : "place",
      name: doc.name,
      category: category,
      description: doc.vicinity || "",
      location: `${doc.geometry.location.lat},${doc.geometry.location.lng}`,
    };
  }

  protected mapToDTO(doc: any): POI {
    // Since fields are optional, no need for default values
    return {
      id: doc.id || generateId(),
      type: doc.type,
      name: doc.name,
      category: doc.category,
      description: doc.description || doc.vicinity,
      location: doc.location || `${doc.geometry?.location?.lat},${doc.geometry?.location?.lng}`,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      createdBy: doc.createdBy,
      updatedBy: doc.updatedBy
    };
  }

  dispose(): void {
    super.dispose();
    // Reset state
    this.pois = [];
    this.categoryFilters = {
      [POICategory.RESTAURANT]: true,
      [POICategory.CAFE]: true,
      [POICategory.BAR]: true,
      [POICategory.BATHROOM]: true,
      [POICategory.LIBRARY]: true
    };
  }
}