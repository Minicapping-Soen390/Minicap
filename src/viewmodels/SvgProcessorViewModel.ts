import { Building, Room } from '../models/Room';
import { SvgProcessorService } from '../services/SvgProcessorService';
import { RoomRepository } from '../repositories/RoomRepository';

export class SvgProcessorViewModel {
  private svgProcessor: SvgProcessorService;
  private roomRepository: RoomRepository;

  constructor() {
    this.svgProcessor = new SvgProcessorService();
    this.roomRepository = new RoomRepository();
  }

  /**
   * Processes an SVG file and saves the extracted building data
   * @param svgFilePath Path to the SVG file
   * @returns Promise<Building> The processed building data
   */
  async processSvgFile(svgFilePath: string): Promise<Building> {
    try {
      // Process SVG file
      const building = await this.svgProcessor.parseSvgFile(svgFilePath);
      
      // Save building data
      await this.roomRepository.saveBuilding(building);
      
      return building;
    } catch (error) {
      console.error('Error processing SVG file:', error);
      throw new Error(`Failed to process SVG file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets building data by ID
   * @param buildingId ID of the building to retrieve
   * @returns Promise<Building> The building data
   */
  async getBuilding(buildingId: string): Promise<Building | undefined> {
    try {
      const buildings = await this.roomRepository.loadBuildings();
      return buildings.find(b => b.id === buildingId);
    } catch (error) {
      console.error('Error getting building:', error);
      throw new Error(`Failed to get building: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Lists all available buildings
   * @returns Promise<string[]> Array of building IDs
   */
  async listBuildings(): Promise<string[]> {
    try {
      const buildings = await this.roomRepository.loadBuildings();
      return buildings.map(b => b.id);
    } catch (error) {
      console.error('Error listing buildings:', error);
      throw new Error(`Failed to list buildings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Searches for rooms across all buildings
   * @param searchTerm The term to search for
   * @returns Promise<Room[]> Array of matching rooms
   */
  async searchRooms(searchTerm: string): Promise<Room[]> {
    try {
      return await this.roomRepository.searchRooms(searchTerm);
    } catch (error) {
      console.error('Error searching rooms:', error);
      throw new Error(`Failed to search rooms: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets building data by ID
   * @param buildingId ID of the building to retrieve
   * @returns Promise<Building> The building data
   */
  async getBuildingById(buildingId: string): Promise<Building | undefined> {
    try {
      const buildings = await this.roomRepository.loadBuildings();
      return buildings.find(b => b.id === buildingId);
    } catch (error) {
      console.error('Error getting building by ID:', error);
      throw new Error(`Failed to get building by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 