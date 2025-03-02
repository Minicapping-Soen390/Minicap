import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Building } from "@/models/Building";
import { Audit } from "@/models/Audit";
import { BuildingRepository } from "@/repositories/BuildingRepository";

export class BuildingViewModel extends BaseViewModel<Building> implements BuildingRepository {
    private readonly COLLECTION_NAME = "buildings";

    async findBuildingById(id: string): Promise<Building> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const doc = await collection.findOne({ _id: id });
            if (!doc) throw new Error(`Building with id ${id} not found`);
            return this.mapToDTO(doc);
        });
    }

    async findBuildingsByCampus(campusId: string): Promise<Building[]> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const docs = await collection.find({ campusId }).toArray();
            return docs.map(doc => this.mapToDTO(doc));
        });
    }

    async getAllBuildings(): Promise<Building[]> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const docs = await collection.find({}).toArray();
            return docs.map(doc => this.mapToDTO(doc));
        });
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

    protected async updateAudit(existingAudit: Partial<Audit> | null, userId: string): Promise<Audit> {
        throw new Error("Buildings are read-only, audit updates not implemented");
    }
}
