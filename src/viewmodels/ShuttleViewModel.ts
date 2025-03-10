import { BaseViewModel } from './BaseViewModel';
import { shuttleService, SHUTTLE_STOPS } from '@/services/ShuttleService';
import { LatLng } from 'react-native-maps';
import { ShuttlePoint, ShuttleDepartureInfo, CampusType, ShuttleRoute } from '@/models/Shuttle';
import { makeAutoObservable, runInAction } from 'mobx';
import { ShuttleRepository, IShuttleRepository, ShuttlePosition, ShuttleStop } from '@/repositories/ShuttleRepository';
import { Audit } from '@/models/Audit';
import { useState, useEffect } from 'react';

interface ShuttleState extends Audit {
  locations: ShuttlePoint[];
  route: LatLng[] | null;
  estimatedWaitTime: number | null;
}

export class ShuttleViewModel extends BaseViewModel<ShuttleState> {
  private _shuttleLocations: ShuttlePoint[] = [];
  private _shuttleRoute: LatLng[] | null = null;
  private _estimatedWaitTime: number | null = null;
  private _isLoading: boolean = false;
  private _error: string | null = null;
  private readonly repository: IShuttleRepository;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(repository: IShuttleRepository) {
    super();
    makeAutoObservable(this);
    this.repository = repository;
  }

  protected mapToDTO(doc: any): ShuttleState {
    return {
      locations: this._shuttleLocations,
      route: this._shuttleRoute,
      estimatedWaitTime: this._estimatedWaitTime,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: doc.id || ''
    };
  }

  get shuttleLocations(): ShuttlePoint[] {
    this.assertNotDisposed();
    return this._shuttleLocations;
  }

  get shuttleRoute(): LatLng[] | null {
    this.assertNotDisposed();
    return this._shuttleRoute;
  }

  get estimatedWaitTime(): number | null {
    this.assertNotDisposed();
    return this._estimatedWaitTime;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get error(): string | null {
    return this._error;
  }

  async fetchShuttleData(): Promise<void> {
    this.assertNotDisposed();
    try {
      runInAction(() => {
        this._isLoading = true;
        this._error = null;
      });

      const busPoints = await this.repository.getShuttleLocations();
      
      runInAction(() => {
        this._shuttleLocations = busPoints;

        if (busPoints.length > 0) {
          const validBusPoints = this.filterValidBusPoints(busPoints);

          if (validBusPoints.length > 0) {
            this._shuttleRoute = this.createRouteFromPoints(validBusPoints);
          }
        }
      });
    } catch (error) {
      runInAction(() => {
        this._error = error instanceof Error ? error.message : 'Failed to fetch shuttle data';
      });
      console.error('Error fetching shuttle data:', error);
    } finally {
      runInAction(() => {
        this._isLoading = false;
      });
    }
  }

  private filterValidBusPoints(busPoints: ShuttlePoint[]): ShuttlePoint[] {
    return busPoints.filter((bus) => {
      const lat = bus.Latitude;
      const lng = bus.Longitude;
      return lat >= 45.45 && lat <= 45.51 && lng >= -73.65 && lng <= -73.57;
    });
  }

  private createRouteFromPoints(validBusPoints: ShuttlePoint[]): LatLng[] {
    const sortedBuses = validBusPoints.sort((a, b) => a.Longitude - b.Longitude);
    
    return [
      { latitude: SHUTTLE_STOPS.LOYOLA.latitude, longitude: SHUTTLE_STOPS.LOYOLA.longitude },
      ...sortedBuses.map((bus) => ({
        latitude: bus.Latitude,
        longitude: bus.Longitude
      })),
      { latitude: SHUTTLE_STOPS.SGW.latitude, longitude: SHUTTLE_STOPS.SGW.longitude }
    ];
  }

  updateEstimatedWaitTime(startCampus: CampusType): void {
    this.assertNotDisposed();
    runInAction(() => {
      if (this._shuttleLocations.length > 0) {
        const stop = startCampus === 'SGW' ? SHUTTLE_STOPS.SGW : SHUTTLE_STOPS.LOYOLA;
        const nearestShuttle = shuttleService.getClosestShuttle(this._shuttleLocations, stop);
        
        if (nearestShuttle) {
          this._estimatedWaitTime = shuttleService.estimateWaitingTime(nearestShuttle, stop);
        }
      }
    });
  }

  getNextDepartureInfo(fromCampus: CampusType): ShuttleDepartureInfo {
    this.assertNotDisposed();
    return shuttleService.getNextDepartureTime(fromCampus);
  }

  reset(): void {
    this.assertNotDisposed();
    runInAction(() => {
      this._shuttleLocations = [];
      this._shuttleRoute = null;
      this._estimatedWaitTime = null;
      this._error = null;
      this._isLoading = false;
    });
  }

  dispose(): void {
    this.reset();
    super.dispose();
  }

  async startTracking(
    onPositionsUpdate: (positions: ShuttlePosition[]) => void,
    onError: (error: Error) => void,
    interval: number = 15000
  ): Promise<void> {
    const updatePositions = async () => {
      try {
        const positions = await this.repository.getShuttlePositions();
        onPositionsUpdate(positions);
      } catch (error) {
        onError(error as Error);
      }
    };

    // Initial update
    await updatePositions();

    // Set up interval
    this.updateInterval = setInterval(updatePositions, interval);
  }

  stopTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async getRouteForShuttles(shuttles: ShuttlePosition[]): Promise<LatLng[]> {
    const stops = this.repository.getShuttleStops();
    const validShuttles = shuttles.filter(shuttle => {
      const lat = parseFloat(shuttle.Latitude);
      const lng = parseFloat(shuttle.Longitude);
      // Filter out buses that are too far from the route
      return lat >= 45.45 && lat <= 45.51 && lng >= -73.65 && lng <= -73.57;
    });

    if (validShuttles.length === 0) return [];

    // Sort shuttles west to east
    const sortedShuttles = validShuttles.sort((a, b) => 
      parseFloat(a.Longitude) - parseFloat(b.Longitude)
    );

    // Create route through all active shuttles
    return [
      { latitude: stops.LOYOLA.latitude, longitude: stops.LOYOLA.longitude },
      ...sortedShuttles.map(shuttle => ({
        latitude: parseFloat(shuttle.Latitude),
        longitude: parseFloat(shuttle.Longitude)
      })),
      { latitude: stops.SGW.latitude, longitude: stops.SGW.longitude }
    ];
  }

  async getNextDepartureInfo(fromCampus: 'SGW' | 'LOYOLA', shuttles: ShuttlePosition[]): Promise<{
    departureTime: string;
    waitTime: number;
    nearestShuttle: ShuttlePosition | null;
  }> {
    const stops = this.repository.getShuttleStops();
    const stop = stops[fromCampus];
    const nearestShuttle = this.repository.getClosestShuttle(shuttles, stop);
    const departureInfo = await this.repository.getNextDeparture(fromCampus);

    return {
      ...departureInfo,
      nearestShuttle
    };
  }
} 