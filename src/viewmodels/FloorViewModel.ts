import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Floor } from "@/models/Floor";
import { FloorRepository } from "@/repositories/FloorRepository";

export class FloorViewModel extends BaseViewModel<Floor> implements FloorRepository {
    private readonly COLLECTION_NAME = "floors";

    async findFloorById(_id: string): Promise<Floor> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async findFloorsByBuilding(buildingId: string): Promise<Floor[]> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    protected mapToDTO(doc: any): Floor {
        throw new Error("NotImplementedError: Operation not implemented");
    }
}
