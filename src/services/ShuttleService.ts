//ShuttleService.ts
import axios from 'axios';
import { shuttleSchedule } from '@/data/shuttleSchedule';

interface ShuttlePoint {
  ID: string;
  Latitude: number;
  Longitude: number;
  IconImage: string;
}

interface ShuttleResponse {
  d: {
    Points: ShuttlePoint[];
  };
}

interface ShuttleSchedule {
  weekday: {
    firstDeparture: string;
    lastDeparture: string;
    frequency: number; // in minutes
  };
  weekend: {
    firstDeparture: string;
    lastDeparture: string;
    frequency: number;
  };
}

export const SHUTTLE_STOPS = {
  SGW: {
    name: 'SGW Campus Shuttle Stop',
    address: 'Hall Building, 1455 De Maisonneuve Blvd. W.',
    latitude: 45.4972,
    longitude: -73.5789
  },
  LOYOLA: {
    name: 'Loyola Campus Shuttle Stop',
    address: 'Loyola Chapel, 7137 Sherbrooke St. W.',
    latitude: 45.4581,
    longitude: -73.6405
  }
};

class ShuttleService {
  private sessionInitialized: boolean = false;

  private async initializeSession(): Promise<void> {
    try {
      await axios.get('https://shuttle.concordia.ca/concordiabusmap/Map.aspx', {
        headers: {
          'Host': 'shuttle.concordia.ca'
        }
      });
      this.sessionInitialized = true;
    } catch (error) {
      console.error('Failed to initialize shuttle session:', error);
      throw new Error('Failed to initialize shuttle tracking');
    }
  }

  async getShuttleLocations(): Promise<ShuttlePoint[]> {
    if (!this.sessionInitialized) {
      await this.initializeSession();
    }

    try {
      const response = await axios.post<ShuttleResponse>(
        'https://shuttle.concordia.ca/concordiabusmap/WebService/GService.asmx/GetGoogleObject',
        {},
        {
          headers: {
            'Host': 'shuttle.concordia.ca',
            'Content-Type': 'application/json; charset=UTF-8'
          }
        }
      );

      return response.data.d.Points.filter(point => point.ID.startsWith('BUS'));
    } catch (error) {
      console.error('Failed to fetch shuttle locations:', error);
      throw new Error('Failed to get shuttle locations');
    }
  }

  getClosestShuttle(shuttleLocations: any[], stop: typeof SHUTTLE_STOPS.SGW): any {
    if (!shuttleLocations || shuttleLocations.length === 0) return null;

    return shuttleLocations.reduce((closest, current) => {
      const currentDistance = this.calculateDistance(
        { latitude: parseFloat(current.Latitude), longitude: parseFloat(current.Longitude) },
        { latitude: stop.latitude, longitude: stop.longitude }
      );

      const closestDistance = closest ? this.calculateDistance(
        { latitude: parseFloat(closest.Latitude), longitude: parseFloat(closest.Longitude) },
        { latitude: stop.latitude, longitude: stop.longitude }
      ) : Infinity;

      return currentDistance < closestDistance ? current : closest;
    }, null);
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

  getNextDepartureTime(fromCampus: 'SGW' | 'LOYOLA'): { departureTime: string; waitTime: number } {
    const schedule = fromCampus === 'SGW' ? shuttleSchedule.SGW : shuttleSchedule.LOY;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert current time to minutes

    // Find the next departure time
    const nextDeparture = schedule.find(time => {
      const [hours, minutes] = time.split(':').map(Number);
      const departureInMinutes = hours * 60 + minutes;
      return departureInMinutes > currentTime;
    });

    if (!nextDeparture) {
      // If no more departures today, return first departure of next day
      const firstDeparture = schedule[0];
      return {
        departureTime: firstDeparture,
        waitTime: this.calculateWaitTime(firstDeparture, true)
      };
    }

    return {
      departureTime: nextDeparture,
      waitTime: this.calculateWaitTime(nextDeparture, false)
    };
  }

  private calculateWaitTime(departureTime: string, isNextDay: boolean): number {
    const now = new Date();
    const [hours, minutes] = departureTime.split(':').map(Number);
    const departure = new Date();
    departure.setHours(hours, minutes, 0);

    if (isNextDay) {
      departure.setDate(departure.getDate() + 1);
    }

    const waitTimeMs = departure.getTime() - now.getTime();
    return Math.round(waitTimeMs / 60000); // Convert to minutes
  }

  estimateWaitingTime(shuttle: any, stop: typeof SHUTTLE_STOPS.SGW): number {
    if (!shuttle) return this.getNextDepartureTime(stop === SHUTTLE_STOPS.SGW ? 'SGW' : 'LOYOLA').waitTime;

    const distanceToStop = this.calculateDistance(
      { latitude: parseFloat(shuttle.Latitude), longitude: parseFloat(shuttle.Longitude) },
      { latitude: stop.latitude, longitude: stop.longitude }
    );

    // Rough estimate: 1km = 2 minutes (30km/h average speed)
    return Math.round(distanceToStop * 2);
  }
}

export const shuttleService = new ShuttleService(); 