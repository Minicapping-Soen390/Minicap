import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Floor } from "@/models/Floor";
import { Audit } from "@/models/Audit";
import { FloorRepository } from "@/repositories/FloorRepository";

export class FloorViewModel extends BaseViewModel<Floor> implements FloorRepository {
    private readonly COLLECTION_NAME = "floors";

    async findFloorById(id: string): Promise<Floor> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const doc = await collection.findOne({ _id: id });
            if (!doc) throw new Error(`Floor with id ${id} not found`);
            return this.mapToDTO(doc);
        });
    }

    async findFloorsByBuilding(buildingId: string): Promise<Floor[]> {
        return this.withCollection(this.COLLECTION_NAME, async (collection) => {
            const docs = await collection.find({ buildingId }).toArray();
            return docs.map(doc => this.mapToDTO(doc));
        });
    }

    protected mapToDTO(doc: any): Floor {
        if (!doc) throw new Error('Floor Not Found');
        
        return {
            _id: doc._id,
            number: doc.number,
            buildingId: doc.buildingId,
            isWheelchairAccessible: doc.isWheelchairAccessible,
            hasElevatorAccess: doc.hasElevatorAccess,
            hasRampAccess: doc.hasRampAccess,
            roomIds: doc.roomIds,
            floorplanId: doc.floorplanId,
            createdAtUTC: doc.createdAtUTC,
            updatedAtUTC: doc.updatedAtUTC,
            createdBy: doc.createdBy,
            updatedBy: doc.updatedBy
        };
    }

    protected async updateAudit(existingAudit: Partial<Audit> | null, userId: string): Promise<Audit> {
        throw new Error("Floors are read-only, audit updates not implemented");
    }
}
