import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { POI, POICategory } from "@/models/POI";
import { Audit } from "@/models/Audit";
import { MapRepository } from "@/repositories/POIRepository";
import uuid from 'react-native-uuid';

export class POIViewModel extends BaseViewModel<POI> implements MapRepository {
    private readonly COLLECTION_NAME = "pois";

    async findPOIById(id: string): Promise<POI> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async getAllPOIs(): Promise<POI[]> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async findPOIsByCategory(category: POICategory): Promise<POI[]> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async findNearbyPOIs(latitude: number, longitude: number, radius: number): Promise<POI[]> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    protected mapToDTO(doc: any): POI {
        throw new Error("NotImplementedError: Operation not implemented");
    }
}
