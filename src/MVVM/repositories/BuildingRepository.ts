import { Building } from "@/MVVM/models/Building";
import { IBuildingRepository } from './Interfaces/IBuildingRepository';
import { BaseRepository } from "./BaseRepository";

// Export the interface for backward compatibility
export { IBuildingRepository as BuildingRepository };

export class BuildingRepositoryImpl extends BaseRepository<Building> implements IBuildingRepository {
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
