import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Floor } from "@/models/Floor";
import { Audit } from "@/models/Audit";
import { FloorRepository } from "@/repositories/FloorRepository";
import { MMKVLoader, create } from "react-native-mmkv-storage";

export class FloorViewModel extends BaseViewModel<Floor> implements FloorRepository {
    private readonly COLLECTION_NAME = "floors";
    // Added MMKV storage instance for floors collection
    private readonly floorStorage = create(new MMKVLoader().initialize());

    async findFloorById(_id: string): Promise<Floor> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async findFloorsByBuilding(buildingId: string): Promise<Floor[]> {
        throw new Error("Not implemented: MongoDB removed");
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
}
