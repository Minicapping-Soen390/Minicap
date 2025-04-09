import { Campus } from '@/MVVM/models/Campus';
import { ICampusRepository } from './Interfaces/ICampusRepository';

// Export the interface for backward compatibility
export { ICampusRepository as CampusRepository };

export class CampusRepositoryImpl implements ICampusRepository {
  // The single instance
  private static instance: CampusRepositoryImpl | null = null;
  
  // Private constructor ensures singleton pattern
  private constructor() {
    // Initialize any resources needed
  }

  // Public static method to get the singleton instance
  public static getInstance(): CampusRepositoryImpl {
    if (!CampusRepositoryImpl.instance) {
      CampusRepositoryImpl.instance = new CampusRepositoryImpl();
    }
    return CampusRepositoryImpl.instance;
  }

  /**
   * Retrieves a campus by its unique identifier
   * @param id - The string of the campus to find
   * @returns Promise resolving to the found Campus
   * @throws {NotFoundError} If campus with given ID doesn't exist
   */
  async findCampusById(id: string): Promise<Campus> {
    throw new Error("Method not implemented: findCampusById");
  }

  /**
   * Retrieves all campuses in the system
   * @returns Promise resolving to array of all Campuses
   * @throws {DatabaseError} If database query fails
   */
  async getAllCampuses(): Promise<Campus[]> {
    throw new Error("Method not implemented: getAllCampuses");
  }
}