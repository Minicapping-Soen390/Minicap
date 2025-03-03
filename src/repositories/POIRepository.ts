import { POI, POICategory } from '@/models/POI';

export interface MapRepository {
  /**
   * Retrieves a POI by its unique identifier
   * @param id - The string of the POI to find
   * @returns Promise resolving to the found POI
   * @throws {NotFoundError} If POI with given ID doesn't exist
   */
  findPOIById(_id: string): Promise<POI>;

  /**
   * Retrieves all POIs in the system
   * @returns Promise resolving to array of all POIs
   * @throws {DatabaseError} If database query fails
   */
  getAllPOIs(): Promise<POI[]>;

  /**
   * Finds POIs by category
   * @param category - The category to filter by
   * @returns Promise resolving to array of matching POIs
   * @throws {DatabaseError} If database query fails
   */
  findPOIsByCategory(category: POICategory): Promise<POI[]>;
}
