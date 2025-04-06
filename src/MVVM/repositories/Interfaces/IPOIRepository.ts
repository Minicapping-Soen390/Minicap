import { POI, POICategory } from "@/MVVM/models/POI";

export interface IPOIRepository {
  /**
   * Gets a point of interest by ID
   * @param poiId - The ID of the POI
   * @returns Promise resolving to the found POI
   * @throws {NotFoundError} If POI doesn't exist
   */
  getPOIById(poiId: string): Promise<any>;
  
  /**
   * Gets all points of interest in a specified radius around coordinates
   * @param latitude - The latitude coordinate
   * @param longitude - The longitude coordinate
   * @param radiusInMeters - Search radius in meters
   * @returns Promise resolving to array of POIs
   */
  getPOIsInRadius(latitude: number, longitude: number, radiusInMeters: number): Promise<any[]>;
  
  /**
   * Gets all points of interest by category
   * @param category - The category to filter by
   * @returns Promise resolving to array of POIs
   */
  getPOIsByCategory(category: any): Promise<any[]>;
  
  /**
   * Creates a new point of interest
   * @param poi - The POI data
   * @param userId - The ID of the user creating the POI
   * @returns Promise resolving to the created POI
   * @throws {ValidationError} If POI data is invalid
   */
  createPOI(poi: any, userId: string): Promise<any>;
  
  /**
   * Updates an existing point of interest
   * @param poiId - The ID of the POI to update
   * @param updates - The updates to apply
   * @param userId - The ID of the user updating the POI
   * @returns Promise resolving to the updated POI
   * @throws {NotFoundError} If POI doesn't exist
   * @throws {AuthorizationError} If not authorized to update the POI
   */
  updatePOI(poiId: string, updates: any, userId: string): Promise<any>;
  
  /**
   * Deletes a point of interest
   * @param poiId - The ID of the POI to delete
   * @param userId - The ID of the user deleting the POI
   * @returns Promise resolving to boolean indicating success
   * @throws {NotFoundError} If POI doesn't exist
   * @throws {AuthorizationError} If not authorized to delete the POI
   */
  deletePOI(poiId: string, userId: string): Promise<boolean>;
}
