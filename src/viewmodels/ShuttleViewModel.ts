import { makeAutoObservable, runInAction } from 'mobx';
import { ShuttleRepository } from '@/repositories/ShuttleRepository';
import { ShuttleState, ShuttlePoint, ShuttleRoute, ShuttleStop, ShuttleDepartureInfo } from '@/models/Shuttle';
import { ShuttleService } from '@/services/ShuttleService';
import { BaseViewModel } from './BaseViewModel';

export class ShuttleViewModel extends BaseViewModel<ShuttleState> implements ShuttleRepository {
  private repository: ShuttleRepository;
  private service: ShuttleService;
  private state: ShuttleState;

  constructor() {
    super();
    this.repository = ShuttleRepository.getInstance();
    this.service = new ShuttleService();
    this.state = {
      locations: [],
      route: null,
      estimatedWaitTime: null,
      isLoading: false,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    makeAutoObservable(this);
  }

  protected mapToDTO(doc: any): ShuttleState {
    return {
      locations: doc.locations ?? [],
      route: doc.route ?? null,
      estimatedWaitTime: doc.estimatedWaitTime ?? null,
      isLoading: doc.isLoading ?? false,
      error: doc.error ?? null,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    };
  }

  get locations(): ShuttlePoint[] {
    this.assertNotDisposed();
    return this.state.locations;
  }

  get route(): ShuttleRoute | null {
    this.assertNotDisposed();
    return this.state.route;
  }

  get estimatedWaitTime(): number | null {
    this.assertNotDisposed();
    return this.state.estimatedWaitTime;
  }

  get isLoading(): boolean {
    return this.state.isLoading;
  }

  get error(): string | null {
    return this.state.error;
  }

  async getShuttleLocations(): Promise<ShuttlePoint[]> {
    return this.repository.getShuttleLocations();
  }

  async getNextDepartureTime(campus: 'SGW' | 'LOYOLA'): Promise<ShuttleDepartureInfo> {
    return this.repository.getNextDepartureTime(campus);
  }

  async getShuttleStops(): Promise<ShuttleStop[]> {
    return this.repository.getShuttleStops();
  }

  async getClosestShuttle(latitude: number, longitude: number): Promise<ShuttlePoint | null> {
    return this.repository.getClosestShuttle(latitude, longitude);
  }

  async estimateWaitingTime(shuttleId: string): Promise<number> {
    return this.repository.estimateWaitingTime(shuttleId);
  }

  async createRouteFromShuttles(shuttles: ShuttlePoint[]): Promise<ShuttleRoute> {
    return this.repository.createRouteFromShuttles(shuttles);
  }

  async fetchShuttleLocations(): Promise<void> {
    this.assertNotDisposed();
    try {
      runInAction(() => {
        this.state.isLoading = true;
        this.state.error = null;
      });
      
      const locations = await this.getShuttleLocations();
      const route = await this.createRouteFromShuttles(locations);
      const waitTime = await this.estimateWaitingTime(locations[0].id);

      runInAction(() => {
        this.state.locations = locations;
        this.state.route = route;
        this.state.estimatedWaitTime = waitTime;
        this.state.updatedAt = new Date();
      });
    } catch (error) {
      runInAction(() => {
        this.state.error = error instanceof Error ? error.message : 'Failed to fetch shuttle locations';
      });
    } finally {
      runInAction(() => {
        this.state.isLoading = false;
      });
    }
  }

  dispose(): void {
    super.dispose();
    this.state = {
      locations: [],
      route: null,
      estimatedWaitTime: null,
      isLoading: false,
      error: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
} 