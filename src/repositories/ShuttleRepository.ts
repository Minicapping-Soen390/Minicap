import axios from 'axios';
import { ShuttlePoint, ShuttleRoute } from '@/models/Shuttle';
import { LatLng } from "react-native-maps";

export interface ShuttleStop {
  name: string;
  latitude: number;
  longitude: number;
}

export interface ShuttlePosition {
  ID: string;
  Latitude: number;
  Longitude: number;
}

export interface DepartureInfo {
  departureTime: string;
  waitTime: number;
}

export interface IShuttleRepository {
  getShuttlePositions(): Promise<ShuttlePosition[]>;
  getNextDeparture(fromCampus: 'SGW' | 'LOYOLA'): Promise<DepartureInfo>;
  getShuttleStops(): { [key: string]: ShuttleStop };
  estimateWaitTime(shuttle: ShuttlePosition, stop: ShuttleStop): number;
  getClosestShuttle(shuttles: ShuttlePosition[], stop: ShuttleStop): ShuttlePosition | null;
}

export class ShuttleRepository {
  private static instance: ShuttleRepository;
  private sessionInitialized: boolean = false;

  private constructor() {}

  static getInstance(): ShuttleRepository {
    if (!ShuttleRepository.instance) {
      ShuttleRepository.instance = new ShuttleRepository();
    }
    return ShuttleRepository.instance;
  }

  private async initializeSession(): Promise<void> {
    if (!this.sessionInitialized) {
      await axios.get('https://shuttle.concordia.ca/concordiabusmap/Map.aspx', {
        headers: {
          Host: 'shuttle.concordia.ca'
        }
      });
      this.sessionInitialized = true;
    }
  }

  async getShuttleLocations(): Promise<ShuttlePoint[]> {
    try {
      await this.initializeSession();

      const response = await axios.post(
        'https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject',
        {},
        {
          headers: {
            Host: 'shuttle.concordia.ca',
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      );

      const shuttleData = response.data.d;
      return shuttleData.Points.filter((point: any) => point.ID.startsWith('BUS'))
        .map((point: any) => ({
          ID: point.ID,
          Latitude: parseFloat(point.Latitude),
          Longitude: parseFloat(point.Longitude),
          IconImage: point.IconImage
        }));
    } catch (error) {
      console.error('Failed to fetch shuttle locations:', error);
      throw new Error('Failed to fetch shuttle locations');
    }
  }
} 