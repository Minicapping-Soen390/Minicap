import { makeAutoObservable, runInAction } from 'mobx';
import { ShuttleRepositoryImpl } from '@/MVVM/repositories/ShuttleRepository';
import { ShuttleState, ShuttlePoint, ShuttleRoute, ShuttleStop, ShuttleDepartureInfo } from '@/MVVM/models/Shuttle';
import { ShuttleService } from '@/MVVM/services/ShuttleService';
import { BaseViewModel } from './BaseViewModel';
import { getErrorMessage,  createAuditObject, generateId  } from '@/Shared/utils/generalUtils';

export class ShuttleViewModel extends BaseViewModel<ShuttleState> {
  private repository: ShuttleRepositoryImpl;
  private service: ShuttleService;
  private state: ShuttleState;

  constructor() {
    super();
    // Use repositories without implementing the interface
    this.repository = (ShuttleRepositoryImpl as any).getInstance();
    this.service = (ShuttleService as any).getInstance();
    
    // Initialize state with audit properties
    const auditObj = createAuditObject();
    this.state = {
      locations: [],
      route: null,
      estimatedWaitTime: null,
      isLoading: false,
      error: null,
      _id: auditObj._id,
      createdAt: auditObj.createdAt,
      updatedAt: auditObj.updatedAt
    };
    makeAutoObservable(this);
  }

  protected mapToDTO(doc: any): ShuttleState {
    return {
      _id: doc._id ?? generateId,
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

  async fetchShuttleLocations(): Promise<void> {
    this.assertNotDisposed();
    try {
      runInAction(() => {
        this.state.isLoading = true;
        this.state.error = null;
      });
      
      // Use repository to get data
      const locations = await this.repository.getShuttleLocations();
      const route = await this.repository.createRouteFromShuttles(locations);
      const waitTime = locations.length > 0 ? 
        await this.repository.estimateWaitingTime(locations[0]._id) : null;

      runInAction(() => {
        this.state.locations = locations;
        this.state.route = route;
        this.state.estimatedWaitTime = waitTime;
        this.state.updatedAt = new Date();
      });
    } catch (error) {
      runInAction(() => {
        this.state.error = error instanceof Error ? getErrorMessage(error) : 'Failed to fetch shuttle locations';
      });
    } finally {
      runInAction(() => {
        this.state.isLoading = false;
      });
    }
  }

  async getNextDepartureInfo(campus: 'SGW' | 'LOYOLA'): Promise<ShuttleDepartureInfo> {
    // Delegate to repository
    return this.repository.getNextDepartureTime(campus);
  }

  async getStops(): Promise<ShuttleStop[]> {
    // Delegate to repository
    return this.repository.getShuttleStops();
  }

  dispose(): void {
    super.dispose();
    // Reset state with fresh audit properties
    const auditObj = createAuditObject();
    this.state = {
      locations: [],
      route: null,
      estimatedWaitTime: null,
      isLoading: false,
      error: null,
      _id: auditObj._id,
      createdAt: auditObj.createdAt,
      updatedAt: auditObj.updatedAt
    };
  }
}