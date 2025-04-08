import { Floor } from '@/MVVM/models/Floor';
import { IFloorRepository } from './Interfaces/IFloorRepository';

// Export the interface for backward compatibility
export { IFloorRepository as FloorRepository };

export class FloorRepositoryImpl implements IFloorRepository {
  // The single instance
  private static instance: FloorRepositoryImpl | null = null;
  
  // Private constructor ensures singleton pattern
  private constructor() {
    // Initialize any resources needed
  }

  // Public static method to get the singleton instance
  public static getInstance(): FloorRepositoryImpl {
    if (!FloorRepositoryImpl.instance) {
      FloorRepositoryImpl.instance = new FloorRepositoryImpl();
    }
    return FloorRepositoryImpl.instance;
  }

  async findFloorById(id: string): Promise<Floor> {
    throw new Error("Method not implemented: findFloorById");
  }

  async findFloorsByBuilding(buildingId: string): Promise<Floor[]> {
    throw new Error("Method not implemented: findFloorsByBuilding");
  }
}
