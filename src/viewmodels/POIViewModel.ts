import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { POI, POICategory } from "@/models/POI";
import { Audit } from "@/models/Audit";
import { MapRepository } from "@/repositories/POIRepository";
import { MMKVLoader, create } from "react-native-mmkv-storage";

export class POIViewModel extends BaseViewModel<POI> implements MapRepository {
    private readonly COLLECTION_NAME = "pois";
    // Added MMKV storage instance for POIs collection
    private readonly poiStorage = create(new MMKVLoader().initialize());

    async findPOIById(_id: string): Promise<POI> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async getAllPOIs(): Promise<POI[]> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async findPOIsByCategory(category: POICategory): Promise<POI[]> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async findNearbyPOIs(latitude: number, longitude: number, radius: number): Promise<POI[]> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async createPOI(data: Omit<POI, '_id' | 'createdAtUTC' | 'updatedAtUTC'>, userId: string): Promise<POI> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async updatePOI(_id: string, data: Partial<POI>, userId: string): Promise<POI> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async deletePOI(_id: string, userId: string): Promise<void> {
        throw new Error("Not implemented: MongoDB removed");
    }

    protected mapToDTO(doc: any): POI {
        if (!doc) throw new Error('POI Not Found');
        
        return {
            _id: doc._id,
            type: doc.type,
            name: doc.name,
            category: doc.category,
            description: doc.description,
            location: doc.location,
            createdAtUTC: doc.createdAtUTC,
            updatedAtUTC: doc.updatedAtUTC,
            createdBy: doc.createdBy,
            updatedBy: doc.updatedBy
        };
    }
}
