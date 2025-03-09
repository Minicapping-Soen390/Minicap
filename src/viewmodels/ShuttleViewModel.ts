import { BaseViewModel } from './BaseViewModel';
import { shuttleService, SHUTTLE_STOPS } from '@/services/ShuttleService';
import { LatLng } from 'react-native-maps';
import { ShuttlePoint, ShuttleDepartureInfo, CampusType, ShuttleRoute } from '@/models/Shuttle';
import { makeAutoObservable, runInAction } from 'mobx';
import { ShuttleRepository } from '@/repositories/ShuttleRepository';
import { Audit } from '@/models/Audit';

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
  private readonly repository: ShuttleRepository;

  constructor() {
    super();
    makeAutoObservable(this);
    this.repository = ShuttleRepository.getInstance();
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
} 