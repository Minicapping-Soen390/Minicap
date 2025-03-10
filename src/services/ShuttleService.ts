import axios from 'axios';
import { IShuttleRepository, ShuttlePosition, ShuttleStop, DepartureInfo } from '@/repositories/ShuttleRepository';

export const SHUTTLE_STOPS: { [key: string]: ShuttleStop } = {
  SGW: {
    name: 'SGW Campus Shuttle Stop',
    latitude: 45.497247,
    longitude: -73.578433,
  },
  LOYOLA: {
    name: 'Loyola Campus Shuttle Stop',
    latitude: 45.458375,
    longitude: -73.640593,
  },
};

export class ShuttleService implements IShuttleRepository {
  private readonly baseUrl = 'https://shuttle.concordia.ca/concordiabusmap';

  async getShuttlePositions(): Promise<ShuttlePosition[]> {
    try {
      // Get session cookies first
      await axios.get(`${this.baseUrl}/Map.aspx`, {
        headers: { Host: 'shuttle.concordia.ca' }
      });

      // Then get shuttle positions
      const response = await axios.post(
        `${this.baseUrl}/WebService/GService.asmx/GetGoogleObject`,
        {},
        {
          headers: {
            Host: 'shuttle.concordia.ca',
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      );

      const shuttleData = response.data.d;
      return shuttleData.Points.filter((point: any) => point.ID.startsWith('BUS'));
    } catch (error) {
      console.error('Error fetching shuttle positions:', error);
      return [];
    }
  }

  getNextDeparture(fromCampus: 'SGW' | 'LOYOLA'): Promise<DepartureInfo> {
    // This would ideally fetch from an API, but for now we'll simulate
    const now = new Date();
    const minutes = now.getMinutes();
    const nextDeparture = Math.ceil(minutes / 15) * 15;
    const waitTime = nextDeparture - minutes;

    return Promise.resolve({
      departureTime: `${now.getHours()}:${nextDeparture.toString().padStart(2, '0')}`,
      waitTime: waitTime <= 0 ? 15 + waitTime : waitTime
    });
  }

  getShuttleStops(): { [key: string]: ShuttleStop } {
    return SHUTTLE_STOPS;
  }

  estimateWaitTime(shuttle: ShuttlePosition, stop: ShuttleStop): number {
    // Calculate distance and estimate time based on average speed
    const distance = this.calculateDistance(
      { latitude: parseFloat(shuttle.Latitude), longitude: parseFloat(shuttle.Longitude) },
      stop
    );
    const averageSpeedKmH = 30; // Average speed in city
    return Math.round((distance / averageSpeedKmH) * 60); // Convert to minutes
  }

  getClosestShuttle(shuttles: ShuttlePosition[], stop: ShuttleStop): ShuttlePosition | null {
    if (!shuttles.length) return null;

    return shuttles.reduce((closest, current) => {
      const closestDistance = this.calculateDistance(
        { latitude: parseFloat(closest.Latitude), longitude: parseFloat(closest.Longitude) },
        stop
      );
      const currentDistance = this.calculateDistance(
        { latitude: parseFloat(current.Latitude), longitude: parseFloat(current.Longitude) },
        stop
      );
      return currentDistance < closestDistance ? current : closest;
    });
  }

  private calculateDistance(point1: { latitude: number; longitude: number }, point2: { latitude: number; longitude: number }): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) * Math.cos(this.deg2rad(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
} 