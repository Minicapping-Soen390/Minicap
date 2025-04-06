import { Room, Building } from '../../models/Room';

export interface IRoomRepository {
  saveBuilding(building: Building): Promise<void>;
  loadBuilding(buildingId: string): Promise<Building>;
  listBuildings(): Promise<string[]>;
  validateBuilding(building: Building): boolean;
}
