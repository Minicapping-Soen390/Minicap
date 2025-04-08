import { Room, Building } from '../models/Room';
import * as fs from 'fs';
import * as path from 'path';
import { getErrorMessage } from '@/Shared/utils/GeneralUtils';
import { IRoomRepository } from './Interfaces/IRoomRepository';

export class RoomRepositoryImpl implements IRoomRepository {
  private readonly dataDir: string;
  private static instance: RoomRepositoryImpl | null = null;

  private constructor(dataDir: string = path.join(process.cwd(), 'data')) {
    this.dataDir = dataDir;
    this.ensureDataDirectory();
  }

  public static getInstance(): RoomRepositoryImpl {
    if (!RoomRepositoryImpl.instance) {
      RoomRepositoryImpl.instance = new RoomRepositoryImpl();
    }
    return RoomRepositoryImpl.instance;
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  public async saveBuilding(building: Building): Promise<void> {
    try {
      const filePath = path.join(this.dataDir, `${building.id}.json`);
      await fs.promises.writeFile(
        filePath,
        JSON.stringify(building, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error saving building data:', error);
      throw new Error(`Failed to save building data: ${getErrorMessage(error)}`);
    }
  }

  public async loadBuilding(buildingId: string): Promise<Building> {
    try {
      const filePath = path.join(this.dataDir, `${buildingId}.json`);
      const data = await fs.promises.readFile(filePath, 'utf-8');
      return JSON.parse(data) as Building;
    } catch (error) {
      console.error('Error loading building data:', error);
      throw new Error(`Failed to load building data: ${getErrorMessage(error)}`);
    }
  }

  public async listBuildings(): Promise<string[]> {
    try {
      const files = await fs.promises.readdir(this.dataDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      console.error('Error listing buildings:', error);
      throw new Error(`Failed to list buildings: ${getErrorMessage(error)}`);
    }
  }

  public validateBuilding(building: Building): boolean {
    try {
      // Check required fields
      if (!building.id || !building.name || !building.floors || !building.rooms) {
        return false;
      }

      // Validate rooms
      for (const room of building.rooms) {
        if (!this.validateRoom(room)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating building data:', error);
      return false;
    }
  }

  public validateRoom(room: Room): boolean {
    try {
      // Check required fields
      if (!room.id || !room.name || !room.coordinates || !room.floor || !room.building) {
        return false;
      }

      // Validate coordinates
      if (!Array.isArray(room.coordinates) || room.coordinates.length === 0) {
        return false;
      }

      for (const point of room.coordinates) {
        if (typeof point.x !== 'number' || typeof point.y !== 'number') {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating room data:', error);
      return false;
    }
  }
}

// Export the interface for backward compatibility
export { IRoomRepository as RoomRepository };