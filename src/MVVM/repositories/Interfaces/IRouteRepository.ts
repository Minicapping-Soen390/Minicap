import { Location } from "@/MVVM/models/Location";
import { Route, RouteSegment, TransportationMode } from "@/MVVM/models/Route";

export interface IRouteRepository {
    // Read operations:
    /**
     * Retrieves a route by its unique identifier
     * @param id - The string of the route to find
     * @returns Promise resolving to the found Route
     * @throws {NotFoundError} If route with given ID doesn't exist
     * @throws {DatabaseError} If database query fails
     */
    findRouteById(id: string): Promise<Route>;

    /**
     * Retrieves all segments belonging to a route
     * @param routeId - The string of the route
     * @returns Promise resolving to array of RouteSegments
     * @throws {NotFoundError} If route with given ID doesn't exist
     * @throws {DatabaseError} If database query fails
     */
    findSegmentsByRouteId(routeId: string): Promise<RouteSegment[]>;

    // Create operations:
    /**
     * Creates a new route with the provided waypoints and transportation mode
     * @param waypoints - Array of locations representing the waypoints
     * @param mode - The transportation mode
     * @param userId - The ID of the user creating the route
     * @returns Promise resolving to the created Route
     * @throws {ValidationError} If input data is invalid
     * @throws {DatabaseError} If database query fails
     */
    createRoute(waypoints: Location[], mode: TransportationMode, userId: string): Promise<Route>;

    /**
     * Finds an existing segment between start and end points or creates one if not found
     * @param startPoint - The starting location
     * @param endPoint - The ending location
     * @param mode - The transportation mode
     * @param userId - The ID of the user creating the segment
     * @returns Promise resolving to the found or created RouteSegment
     * @throws {ValidationError} If input data is invalid
     * @throws {DatabaseError} If database query fails
     */
    findOrCreateSegment(startPoint: Location, endPoint: Location, mode: TransportationMode, userId: string): Promise<RouteSegment>;

    // Update operations:
    /**
     * Updates the details of an existing route
     * @param id - The ID of the route to update
     * @param updates - Partial object containing the updates
     * @param userId - The ID of the user updating the route
     * @returns Promise resolving to the updated Route
     * @throws {NotFoundError} If route with given ID doesn't exist
     * @throws {ValidationError} If input data is invalid
     * @throws {DatabaseError} If database query fails
     */
    updateRoute(id: string, updates: Partial<Route>, userId: string): Promise<Route>;

    /**
     * Updates the details of an existing route segment
     * @param segmentId - The ID of the segment to update
     * @param updates - Partial object containing the updates
     * @param userId - The ID of the user updating the segment
     * @returns Promise resolving to the updated RouteSegment
     * @throws {NotFoundError} If segment with given ID doesn't exist
     * @throws {ValidationError} If input data is invalid
     * @throws {DatabaseError} If database query fails
     */
    updateSegment(segmentId: string, updates: Partial<RouteSegment>, userId: string): Promise<RouteSegment>;

    // Delete operations:
    /**
     * Deletes an existing route by its id
     * @param id - The ID of the route to delete
     * @param userId - The ID of the user deleting the route
     * @returns Promise resolving to void
     * @throws {NotFoundError} If route with given ID doesn't exist
     * @throws {DatabaseError} If database query fails
     */
    deleteRoute(id: string, userId: string): Promise<void>;

    // Calculation:
    /**
     * Calculates and updates the path for a given route segment
     * @param segmentId - The ID of the segment to calculate the path for
     * @param userId - The ID of the user requesting the calculation
     * @returns Promise resolving to the updated RouteSegment
     * @throws {NotFoundError} If segment with given ID doesn't exist
     * @throws {CalculationError} If path calculation fails
     */
    calculatePath(segmentId: string, userId: string): Promise<RouteSegment>;
}
