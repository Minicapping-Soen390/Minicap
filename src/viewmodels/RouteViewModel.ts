import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Route, RouteSegment, TransportationMode } from "@/models/Route";
import { Location } from "@/models/Location";
import { RouteRepository } from "@/repositories/RouteRepository";
import { Audit } from "@/models/Audit";

export class RouteViewModel extends BaseViewModel<Route> implements RouteRepository {
    private readonly ROUTES_COLLECTION = "routes";
    private readonly SEGMENTS_COLLECTION = "routeSegments";

    constructor() {
        super();
    }
    async updateRoute(_id: string, updates: Partial<Route>, userId: string): Promise<Route> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async deleteRoute(_id: string, userId: string): Promise<void> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async findRouteById(_id: string): Promise<Route> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async findSegmentsByRouteId(routeId: string): Promise<RouteSegment[]> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async findOrCreateSegment(
        startPoint: Location,
        endPoint: Location,
        mode: TransportationMode,
        userId: string
    ): Promise<RouteSegment> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async updateSegment(
        segmentId: string, 
        updates: Partial<RouteSegment>,
        userId: string
    ): Promise<RouteSegment> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async createRoute(
        waypoints: Location[],
        mode: TransportationMode,
        userId: string
    ): Promise<Route> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async calculatePath(segmentId: string, userId: string): Promise<RouteSegment> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    protected mapToDTO<T extends Route | RouteSegment>(doc: any): T {
        throw new Error("NotImplementedError: Operation not implemented");
    }
}
