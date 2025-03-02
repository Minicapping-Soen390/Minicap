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

    async findRouteById(id: string): Promise<Route> {
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
        segmentId: string, 
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

    async calculatePath(segmentId: string, userId: string): Promise<RouteSegment> {
        throw new Error("Method not implemented: calculatePath");
    }

    protected mapToDTO<T extends Route | RouteSegment>(doc: any): T {
        throw new Error("Method not implemented: mapToDTO");
    }

    protected async updateAudit(existingAudit: Partial<Audit> | null, userId: string): Promise<Audit> {
        throw new Error("Method not implemented: updateAudit");
    }
}
