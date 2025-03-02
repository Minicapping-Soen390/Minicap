import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Building } from "@/models/Building";
import { Audit } from "@/models/Audit";
import { BuildingRepository } from "@/repositories/BuildingRepository";
import { MMKVLoader, create } from "react-native-mmkv-storage";

export class BuildingViewModel extends BaseViewModel<Building> implements BuildingRepository {
    private readonly COLLECTION_NAME = "buildings";
    // Added MMKV storage instance for buildings collection
    private readonly buildingStorage = create(new MMKVLoader().initialize());

    async findBuildingById(_id: string): Promise<Building> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async findBuildingsByCampus(campusId: string): Promise<Building[]> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async getAllBuildings(): Promise<Building[]> {
        throw new Error("Not implemented: MongoDB removed");
    }

    protected mapToDTO(doc: any): Building {
        return {
            _id: doc._id,  // Already string, no conversion needed
            name: doc.name,
            address: doc.address,
            description: doc.description,
            floors: doc.floors || [],
            outdoorLocation: doc.location,
            createdAtUTC: doc.createdAtUTC,
            updatedAtUTC: doc.updatedAtUTC,
            createdBy: doc.createdBy,
            updatedBy: doc.updatedBy
        };
    }
}
