import { Floor } from '@/MVVM/models/Floor';
import { IFloorRepository } from './Interfaces/IFloorRepository';
import { BaseRepository } from './BaseRepository';

// Export the interface for backward compatibility
export { IFloorRepository as FloorRepository };

export class FloorRepositoryImpl extends BaseRepository<Floor> implements IFloorRepository {
  async findFloorById(id: string): Promise<Floor> {
    throw new Error("Method not implemented: findFloorById");
  }

  async findFloorsByBuilding(buildingId: string): Promise<Floor[]> {
    throw new Error("Method not implemented: findFloorsByBuilding");
  }
}
