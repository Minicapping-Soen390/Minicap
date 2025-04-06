import { Floor } from '@/MVVM/models/Floor';

export interface IFloorRepository {
  /**
   * Retrieves a floor by its unique identifier
   * @param id - The string of the floor to find
   * @returns Promise resolving to the found Floor
   * @throws {NotFoundError} If floor with given ID doesn't exist
   */
  findFloorById(_id: string): Promise<Floor>;

  /**
   * Retrieves all floors of a specific building
   * @param buildingId - The string of the building
   * @returns Promise resolving to array of Floors
   * @throws {NotFoundError} If building with given ID doesn't exist
   */
  findFloorsByBuilding(buildingId: string): Promise<Floor[]>;
}
