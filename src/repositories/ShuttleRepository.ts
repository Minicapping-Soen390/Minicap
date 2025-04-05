import { ShuttlePoint, ShuttleRoute, ShuttleDepartureInfo } from '@/models/Shuttle';
import { ShuttleStop } from '../models/Shuttle';
import { LatLng } from 'react-native-maps';

export class ShuttleError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ShuttleError';
  }
}

export interface ShuttleRepository {
  getShuttleLocations(): Promise<ShuttlePoint[]>;
  getNextDepartureTime(campus: 'SGW' | 'LOYOLA'): Promise<ShuttleDepartureInfo>;
  getShuttleStops(): Promise<ShuttleStop[]>;
  getClosestShuttle(latitude: number, longitude: number): Promise<ShuttlePoint | null>;
  estimateWaitingTime(shuttleId: string): Promise<number>;
  createRouteFromShuttles(shuttles: ShuttlePoint[]): Promise<ShuttleRoute>;
}

export class ShuttleRepositoryImpl implements ShuttleRepository {
  private static instance: ShuttleRepositoryImpl;
  private readonly mockStops: ShuttleStop[] = [
    {
      id: 'sgw',
      name: 'SGW Campus',
      address: '1455 De Maisonneuve Blvd W',
      latitude: 45.4973,
      longitude: -73.5789,
      campusType: 'SGW',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'loyola',
      name: 'Loyola Campus',
      address: '7141 Sherbrooke St W',
      latitude: 45.4581,
      longitude: -73.6405,
      campusType: 'LOYOLA',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private constructor() {}

  public static getInstance(): ShuttleRepositoryImpl {
    if (!ShuttleRepositoryImpl.instance) {
      ShuttleRepositoryImpl.instance = new ShuttleRepositoryImpl();
    }
    return ShuttleRepositoryImpl.instance;
  }

  async getShuttleLocations(): Promise<ShuttlePoint[]> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return [
        {
          id: 'BUS1',
          latitude: 45.4973,
          longitude: -73.5789,
          speed: 30,
          heading: 90,
          icon: 'bus',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'BUS2',
          latitude: 45.4581,
          longitude: -73.6405,
          speed: 25,
          heading: 270,
          icon: 'bus',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    } catch (error: any) {
      console.error("Error in getShuttleLocations:", error);
      throw new ShuttleError(
        `Failed to fetch shuttle locations: ${error.message || "Unknown error"}`,
        'FETCH_ERROR'
      );
    }
  }

  async getNextDepartureTime(campus: 'SGW' | 'LOYOLA'): Promise<ShuttleDepartureInfo> {
    const now = new Date();
    const departureTime = new Date(now.getTime() + 15 * 60000); // 15 minutes from now

    return {
      id: `departure-${campus}-${departureTime.getTime()}`,
      departureTime,
      waitTime: 15,
      campus,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getShuttleStops(): Promise<ShuttleStop[]> {
    return this.mockStops;
  }

  async getClosestShuttle(latitude: number, longitude: number): Promise<ShuttlePoint | null> {
    const locations = await this.getShuttleLocations();
    if (locations.length === 0) return null;

    let closest = locations[0];
    let minDistance = this.calculateDistance(latitude, longitude, closest.latitude, closest.longitude);

    for (const location of locations.slice(1)) {
      const distance = this.calculateDistance(latitude, longitude, location.latitude, location.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        closest = location;
      }
    }

    return closest;
  }

  async estimateWaitingTime(shuttleId: string): Promise<number> {
    // Mock implementation: return random wait time between 5-20 minutes
    return Math.floor(Math.random() * 15) + 5;
  }

  async createRouteFromShuttles(shuttles: ShuttlePoint[]): Promise<ShuttleRoute> {
    const stops = await this.getShuttleStops();
    const points: LatLng[] = [
      { latitude: stops[0].latitude, longitude: stops[0].longitude },
      ...shuttles.map(shuttle => ({
        latitude: shuttle.latitude,
        longitude: shuttle.longitude
      })),
      { latitude: stops[1].latitude, longitude: stops[1].longitude }
    ];

    return {
      id: 'route-' + Date.now(),
      name: 'Shuttle Route',
      points,
      color: '#007AFF',
      width: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
} 