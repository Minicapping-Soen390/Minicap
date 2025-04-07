import { runInAction, makeAutoObservable } from 'mobx';
import { POI, POICategory } from '@/MVVM/models/POI';
import { BaseViewModel } from './BaseViewModel';
import { IPOIRepository } from '@/MVVM/repositories/Interfaces/IPOIRepository';
import { Audit } from '@/MVVM/models/Audit';
import { generateId } from '@/Shared/utils/generalUtils';

export class POIViewModel extends BaseViewModel<POI> {
  pois: POI[] = [];
  
  constructor(private readonly poiRepository: IPOIRepository) {
    super();
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

  protected mapToDTO(doc: any): POI {
    // Since fields are optional, no need for default values
    return {
      _id: doc.id || generateId(),
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
}