import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Campus } from "@/models/Campus";
import { CampusRepository } from "@/repositories/CampusRepository";

export class CampusViewModel extends BaseViewModel<Campus> implements CampusRepository {
    private readonly COLLECTION_NAME = "campus";

    async findCampusById(_id: string): Promise<Campus> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async getAllCampuses(): Promise<Campus[]> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    protected mapToDTO(doc: any): Campus {
        throw new Error("NotImplementedError: Operation not implemented");
    }
}