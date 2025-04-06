import { ShuttlePoint, ShuttleRoute, ShuttleDepartureInfo } from '@/MVVM/models/Shuttle';
import { ShuttleStop } from '../../models/Shuttle';
import { LatLng } from 'react-native-maps';

export interface IShuttleRepository {
  /**
   * Gets the current locations of all shuttles
   * @returns Promise resolving to array of shuttle points
   * @throws {ShuttleError} If there's an error fetching shuttle locations
   */
  getShuttleLocations(): Promise<ShuttlePoint[]>;
  
  /**
   * Gets the next departure time for a specified campus
   * @param campus The campus identifier ('SGW' or 'LOYOLA')
   * @returns Promise resolving to departure information
   */
  getNextDepartureTime(campus: 'SGW' | 'LOYOLA'): Promise<ShuttleDepartureInfo>;
  
  /**
   * Gets all shuttle stops
   * @returns Promise resolving to array of shuttle stops
   */
  getShuttleStops(): Promise<ShuttleStop[]>;
  
  /**
   * Gets the closest shuttle to a specified location
   * @param latitude The latitude coordinate
   * @param longitude The longitude coordinate
   * @returns Promise resolving to the closest shuttle or null if none found
   */
  getClosestShuttle(latitude: number, longitude: number): Promise<ShuttlePoint | null>;
  
  /**
   * Estimates the waiting time for a specific shuttle
   * @param shuttleId The ID of the shuttle
   * @returns Promise resolving to estimated waiting time in minutes
   */
  estimateWaitingTime(shuttleId: string): Promise<number>;
  
  /**
   * Creates a route from shuttle positions
   * @param shuttles Array of shuttle points to create route from
   * @returns Promise resolving to the created shuttle route
   */
  createRouteFromShuttles(shuttles: ShuttlePoint[]): Promise<ShuttleRoute>;
}
