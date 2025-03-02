import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Campus } from "@/models/Campus";
import { Audit } from "@/models/Audit";
import { CampusRepository } from "@/repositories/CampusRepository";
import { MMKVLoader, create } from "react-native-mmkv-storage";

export class CampusViewModel extends BaseViewModel<Campus> implements CampusRepository {
    private readonly COLLECTION_NAME = "campus";
    // Added MMKV storage instance for campus collection
    private readonly campusStorage = create(new MMKVLoader().initialize());

    async findCampusById(_id: string): Promise<Campus> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async getAllCampuses(): Promise<Campus[]> {
        throw new Error("Not implemented: MongoDB removed");
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
}