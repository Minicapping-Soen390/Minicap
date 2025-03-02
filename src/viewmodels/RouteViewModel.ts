import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Route, RouteSegment, TransportationMode } from "@/models/Route";
import { Location } from "@/models/Location";
import { RouteRepository } from "@/repositories/RouteRepository";
import { MMKVLoader, create } from "react-native-mmkv-storage";

export class RouteViewModel extends BaseViewModel<Route> implements RouteRepository {
    private readonly ROUTES_COLLECTION = "routes";
    private readonly SEGMENTS_COLLECTION = "routeSegments";
    // Added MMKV storage instance for routes collection
    private readonly routeStorage = create(new MMKVLoader().initialize());

    constructor() {
        super();
    }

    async findRouteById(_id: string): Promise<Route> {
        throw new Error("Method not implemented: findRouteById");
    }

    async findSegmentsByRouteId(routeId: string): Promise<RouteSegment[]> {
        throw new Error("Method not implemented: findSegmentsByRouteId");
    }

    async findOrCreateSegment(
        startPoint: Location,
        endPoint: Location,
        mode: TransportationMode,
        userId: string
    ): Promise<RouteSegment> {
        throw new Error("Method not implemented: findOrCreateSegment");
    }

    async updateSegment(
        _id: string, 
        updates: Partial<RouteSegment>,
        userId: string
    ): Promise<RouteSegment> {
        throw new Error("Method not implemented: updateSegment");
    }

    async createRoute(
        waypoints: Location[],
        mode: TransportationMode,
        userId: string
    ): Promise<Route> {
        throw new Error("Method not implemented: createRoute");
    }

    async calculatePath(_id: string, userId: string): Promise<RouteSegment> {
        throw new Error("Method not implemented: calculatePath");
    }

    protected mapToDTO(doc: any): Route {
        if (!doc) throw new Error("Document not found");
        return {
            _id: doc._id,
            // ...removed audit data...
            ...doc
        } as Route;
    }
}
