import { POI, POICategory } from '@/models/POI';

export interface MapRepository {
  /**
   * Retrieves a POI by its unique identifier
   * @param _id - The string of the POI to find
   * @returns Promise resolving to the found POI
   * @throws {NotFoundError} If POI with given _id doesn't exist
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

  /**
   * Creates a new POI in the system with audit trail
   * @param data - POI data without system-managed fields
   * @param userId - ID of user creating the POI for audit
   * @returns Promise resolving to the created POI with audit
   * @throws {ValidationError} If required fields are missing or invalid
   */
  createPOI(data: Omit<POI, '_id' | 'createdAtUTC' | 'updatedAtUTC'>, userId: string): Promise<POI>;

  /**
   * Updates an existing POI's information and audit trail
   * @param _id - The string of the POI to update
   * @param data - Partial POI data to update
   * @param userId - ID of user updating the POI for audit
   * @returns Promise resolving to the updated POI with new audit
   * @throws {NotFoundError} If POI with given _id doesn't exist
   */
  updatePOI(_id: string, data: Partial<POI>, userId: string): Promise<POI>;

  /**
   * Removes a POI and logs deletion in audit
   * @param _id - The string of the POI to delete
   * @param userId - ID of user deleting the POI for audit
   * @throws {NotFoundError} If POI with given _id doesn't exist
   */
  deletePOI(_id: string, userId: string): Promise<void>;
}
