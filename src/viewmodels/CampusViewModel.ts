import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Campus } from "@/models/Campus";
import { Audit } from "@/models/Audit";
import { CampusRepository } from "@/repositories/CampusRepository";

export class CampusViewModel extends BaseViewModel<Campus> implements CampusRepository {
    private readonly COLLECTION_NAME = "campus";

    async findCampusById(id: string): Promise<Campus> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const doc = await collection.findOne({ _id: id });
            if (!doc) throw new Error(`Campus with id ${id} not found`);
            return this.mapToDTO(doc);
        });
    }

    async getAllCampuses(): Promise<Campus[]> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const docs = await collection.find({}).toArray();
            return docs.map(doc => this.mapToDTO(doc));
        });
    }

    protected mapToDTO(doc: any): Campus {
        if (!doc) throw new Error('Campus Not Found');
        
        return {
            _id: doc._id,
            name: doc.name,
            buildingIds: doc.buildingIds || [],
            outdoorLocation: doc.outdoorLocation,
            createdAtUTC: doc.createdAtUTC,
            updatedAtUTC: doc.updatedAtUTC,
            createdBy: doc.createdBy,
            updatedBy: doc.updatedBy
        };
    }

    protected async updateAudit(existingAudit: Partial<Audit> | null, userId: string): Promise<Audit> {
        throw new Error("Campuses are read-only, audit updates not implemented");
    }
}