import { Campus } from '@/models/Campus';

export interface CampusRepository {
  /**
   * Retrieves a campus by its unique identifier
   * @param id - The string of the campus to find
   * @returns Promise resolving to the found Campus
   * @throws {NotFoundError} If campus with given ID doesn't exist
   */
  findCampusById(id: string): Promise<Campus>;

  /**
   * Retrieves all campuses in the system
   * @returns Promise resolving to array of all Campuses
   * @throws {DatabaseError} If database query fails
   */
  getAllCampuses(): Promise<Campus[]>;
}