import { Room, Building } from '../models/Room';
import * as fs from 'fs';
import * as path from 'path';

export class RoomRepository {
  private dataDir: string;
  private buildingsFile: string;

  constructor(dataDir: string = 'data') {
    this.dataDir = dataDir;
    this.buildingsFile = path.join(this.dataDir, 'buildings.json');
    this.ensureDataDirectoryExists();
  }

  private ensureDataDirectoryExists(): void {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Saves building data to the JSON storage
   * @param building Building data to save
   */
  async saveBuilding(building: Building): Promise<void> {
    try {
      // Load existing buildings
      const buildings = await this.loadBuildings();
      
      // Update or add the building
      const index = buildings.findIndex(b => b.id === building.id);
      if (index >= 0) {
        buildings[index] = building;
      } else {
        buildings.push(building);
      }
      
      // Save back to file
      await fs.promises.writeFile(this.buildingsFile, JSON.stringify(buildings, null, 2));
    } catch (error) {
      console.error('Error saving building data:', error);
      throw new Error(`Failed to save building data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Loads all buildings from storage
   * @returns Promise<Building[]> Array of buildings
   */
  async loadBuildings(): Promise<Building[]> {
    try {
      if (!fs.existsSync(this.buildingsFile)) {
        return [];
      }
      
      const data = await fs.promises.readFile(this.buildingsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading building data:', error);
      throw new Error(`Failed to load building data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lists all buildings in storage
   * @returns Promise<Building[]> Array of buildings
   */
  async listBuildings(): Promise<Building[]> {
    try {
      return await this.loadBuildings();
    } catch (error) {
      console.error('Error listing buildings:', error);
      throw new Error(`Failed to list buildings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Searches for rooms across all buildings
   * @param query Search query
   * @returns Promise<Room[]> Array of matching rooms
   */
  async searchRooms(query: string): Promise<Room[]> {
    try {
      const buildings = await this.loadBuildings();
      const normalizedQuery = query.toLowerCase();
      
      return buildings.flatMap(building =>
        building.rooms.filter(room =>
          room.searchTerms.some(term => term.includes(normalizedQuery))
        ).map(room => ({
          ...room,
          building: building.name
        }))
      );
    } catch (error) {
      console.error('Error searching rooms:', error);
      throw new Error(`Failed to search rooms: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates building data structure
   * @param building Building data to validate
   * @returns boolean True if the data is valid
   */
  validateBuilding(building: Building): boolean {
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

  /**
   * Validates room data structure
   * @param room Room data to validate
   * @returns boolean True if the data is valid
   */
  private validateRoom(room: Room): boolean {
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