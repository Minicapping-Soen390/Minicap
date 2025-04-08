import { Building } from "@/MVVM/models/Building";
import { IBuildingRepository } from './Interfaces/IBuildingRepository';

// Export the interface for backward compatibility
export { IBuildingRepository as BuildingRepository };

export class BuildingRepositoryImpl implements IBuildingRepository {
  // The single instance
  private static instance: BuildingRepositoryImpl | null = null;
  
  // Private constructor ensures singleton pattern
  private constructor() {
    // Initialize any resources needed
  }

  // Public static method to get the singleton instance
  public static getInstance(): BuildingRepositoryImpl {
    if (!BuildingRepositoryImpl.instance) {
      BuildingRepositoryImpl.instance = new BuildingRepositoryImpl();
    }
    return BuildingRepositoryImpl.instance;
  }

  async findBuildingById(id: string): Promise<Building> {
    throw new Error("Method not implemented: findBuildingById");
  }

  async findBuildingsByCampus(campusId: string): Promise<Building[]> {
    throw new Error("Method not implemented: findBuildingsByCampus");
  }

  async getAllBuildings(): Promise<Building[]> {
    throw new Error("Method not implemented: getAllBuildings");
  }
}
