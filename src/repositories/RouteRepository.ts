import { Location } from "@/models/Location";
import { Route, RouteSegment, TransportationMode } from "@/models/Route";

export interface RouteRepository {
    /**
     * Retrieves a route by its unique identifier
     * @param id - The string of the route to find
     * @returns Promise resolving to the found Route
     * @throws {NotFoundError} If route with given ID doesn't exist
     * @throws {DatabaseError} If database query fails
     */
    findRouteById(id: string): Promise<Route>;

    /**
     * Creates a new route by generating segments between waypoints
     * All waypoints must be of the same location type (indoor or outdoor)
     * @param waypoints - Array of locations to route through
     * @param mode - Transportation mode to use
     * @param userId - User creating the route
     * @returns Promise resolving to the created Route
     * @throws {ValidationError} If waypoint types don't match
     * @throws {ValidationError} If waypoints array has less than 2 points
     * @throws {DatabaseError} If database operation fails
     */
    createRoute(waypoints: Location[], mode: TransportationMode, userId: string): Promise<Route>;

    /**
     * Finds or creates a route segment between two locations
     * Both locations must be of the same type
     * @param start - Starting location
     * @param end - Ending location
     * @param mode - Transportation mode
     * @param userId - User creating/accessing the segment
     * @returns Promise resolving to the RouteSegment
     * @throws {ValidationError} If location types don't match
     * @throws {DatabaseError} If database operation fails
     */
    findOrCreateSegment(start: Location, end: Location, mode: TransportationMode, userId: string): Promise<RouteSegment>;

    /**
     * Updates a route segment (e.g., mark as obstructed, change path)
     * @param segmentId - The string of the segment to update
     * @param updates - Partial segment data to update
     * @param userId - User updating the segment
     * @returns Promise resolving to updated RouteSegment
     * @throws {NotFoundError} If segment with given ID doesn't exist
     * @throws {ValidationError} If updates are invalid
     * @throws {DatabaseError} If database operation fails
     */
    updateSegment(segmentId: string, updates: Partial<RouteSegment>, userId: string): Promise<RouteSegment>;

    /**
     * Retrieves all segments belonging to a route
     * @param routeId - The string of the route
     * @returns Promise resolving to array of RouteSegments
     * @throws {NotFoundError} If route with given ID doesn't exist
     * @throws {DatabaseError} If database query fails
     */
    findSegmentsByRouteId(routeId: string): Promise<RouteSegment[]>;

    /**
     * Calculates and updates the path for a route segment
     * @param segmentId - The string of the segment to calculate path for
     * @param userId - User triggering the path calculation
     * @returns Promise resolving to updated RouteSegment with new path
     * @throws {NotFoundError} If segment with given ID doesn't exist
     * @throws {NotImplementedError} If path calculation is not implemented for segment type
     * @throws {DatabaseError} If database operation fails
     */
    calculatePath(segmentId: string, userId: string): Promise<RouteSegment>;
}
