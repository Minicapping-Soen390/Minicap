import { Room, Building } from '../../models/Room';

export interface IRoomRepository {
  /**
   * Save building data to the repository
   * @param building The building to save
   * @returns Promise<void>
   * @throws {Error} If saving fails
   */
  saveBuilding(building: Building): Promise<void>;
  
  /**
   * Load building data from the repository
   * @param buildingId The ID of the building to load
   * @returns Promise<Building> The loaded building
   * @throws {Error} If loading fails or building doesn't exist
   */
  loadBuilding(buildingId: string): Promise<Building>;
  
  /**
   * List all available buildings
   * @returns Promise<string[]> Array of building IDs
   * @throws {Error} If listing fails
   */
  listBuildings(): Promise<string[]>;
  
  /**
   * Validate building data structure
   * @param building The building to validate
   * @returns boolean True if valid, false otherwise
   */
  validateBuilding(building: Building): boolean;
  
  /**
   * Validate room data structure
   * @param room The room to validate
   * @returns boolean True if valid, false otherwise
   */
  validateRoom(room: Room): boolean;
}
