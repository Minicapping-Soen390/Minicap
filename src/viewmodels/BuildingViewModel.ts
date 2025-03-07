import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Building } from "@/models/Building";
import { BuildingRepository } from "@/repositories/BuildingRepository";

export class BuildingViewModel extends BaseViewModel<Building> implements BuildingRepository {
    private readonly COLLECTION_NAME = "buildings";

    async findBuildingById(id: string): Promise<Building> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async findBuildingsByCampus(campusId: string): Promise<Building[]> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async getAllBuildings(): Promise<Building[]> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    protected mapToDTO(doc: any): Building {
        throw new Error("NotImplementedError: Operation not implemented");
    }
}
