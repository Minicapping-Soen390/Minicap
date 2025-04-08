import { Room, Building } from '@/MVVM/models/Room';
import { RoomService } from '@/MVVM/services/RoomService';
import { RoomRepositoryImpl } from '@/MVVM/repositories/RoomRepository';
import { BaseViewModel } from './BaseViewModel';
import { makeAutoObservable, runInAction } from 'mobx';
import { getErrorMessage, createAuditObject, generateId } from '@/Shared/utils/generalUtils';

export interface RoomSearchState {
  id: string;
  query: string;
  results: Array<{ room: Room; building: Building }>;
  isLoading: boolean;
  error: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class RoomViewModel extends BaseViewModel<RoomSearchState> {
  private repository: RoomRepositoryImpl;
  private service: RoomService;
  private state: RoomSearchState;

  constructor() {
    super();
    // Get repository and service singleton instances
    this.repository = RoomRepositoryImpl.getInstance();
    this.service = RoomService.getInstance();
    
    // Initialize state with audit properties
    const auditObj = createAuditObject();
    this.state = {
      id: auditObj.id,
      query: '',
      results: [],
      isLoading: false,
      error: null,
      createdAt: auditObj.createdAt,
      updatedAt: auditObj.updatedAt
    };
    makeAutoObservable(this);
  }

  protected mapToDTO(doc: any): RoomSearchState {
    return {
      id: doc.id ?? generateId(),
      query: doc.query ?? '',
      results: doc.results ?? [],
      isLoading: doc.isLoading ?? false,
      error: doc.error ?? null,
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    };
  }

  get query(): string {
    this.assertNotDisposed();
    return this.state.query;
  }

  set query(value: string) {
    this.assertNotDisposed();
    runInAction(() => {
      this.state.query = value;
    });
  }

  get results(): Array<{ room: Room; building: Building }> {
    this.assertNotDisposed();
    return this.state.results;
  }

  get isLoading(): boolean {
    return this.state.isLoading;
  }

  get error(): string | null {
    return this.state.error;
  }

  async searchRooms(): Promise<void> {
    this.assertNotDisposed();
    if (!this.state.query.trim()) {
      runInAction(() => {
        this.state.results = [];
      });
      return;
    }

    try {
      runInAction(() => {
        this.state.isLoading = true;
        this.state.error = null;
      });

      // Get all buildings from repository
      const buildingIds = await this.repository.listBuildings();
      const buildings: Building[] = [];
      
      for (const id of buildingIds) {
        try {
          const building = await this.repository.loadBuilding(id);
          buildings.push(building);
        } catch (error) {
          console.error(`Error loading building ${id}:`, error);
        }
      }
      
      // Use service to search rooms
      const results = this.service.searchRooms(buildings, this.state.query);
      
      runInAction(() => {
        this.state.results = results;
        this.state.updatedAt = new Date();
      });
    } catch (error) {
      runInAction(() => {
        this.state.error = getErrorMessage(error);
      });
    } finally {
      runInAction(() => {
        this.state.isLoading = false;
      });
    }
  }

  async searchRoomsInBuilding(building: Building): Promise<Room[]> {
    this.assertNotDisposed();
    return this.service.searchRoomsInBuilding(building, this.state.query);
  }

  dispose(): void {
    super.dispose();
    // Reset state with fresh audit properties
    const auditObj = createAuditObject();
    this.state = {
      id: auditObj.id,
      query: '',
      results: [],
      isLoading: false,
      error: null,
      createdAt: auditObj.createdAt,
      updatedAt: auditObj.updatedAt
    };
  }
}