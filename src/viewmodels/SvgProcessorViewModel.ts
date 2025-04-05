import { SvgProcessorService } from '../services/SvgProcessorService';
import { RoomRepository } from '../repositories/RoomRepository';
import { Building } from '../models/Room';

export class SvgProcessorViewModel {
  private svgProcessor: SvgProcessorService;
  private roomRepository: RoomRepository;

  constructor() {
    this.svgProcessor = new SvgProcessorService();
    this.roomRepository = new RoomRepository();
  }

  /**
   * Processes an SVG file and saves the extracted data
   * @param svgFilePath Path to the SVG file
   * @returns Promise<Building> The processed building data
   */
  async processSvgFile(svgFilePath: string): Promise<Building> {
    try {
      // Parse SVG file
      const building = await this.svgProcessor.parseSvgFile(svgFilePath);

      // Validate data
      if (!this.roomRepository.validateBuilding(building)) {
        throw new Error('Invalid building data structure');
      }

      // Save to repository
      await this.roomRepository.saveBuilding(building);

      return building;
    } catch (error) {
      console.error('Error processing SVG file:', error);
      throw new Error(`Failed to process SVG file: ${error.message}`);
    }
  }

  /**
   * Loads building data from the repository
   * @param buildingId ID of the building to load
   * @returns Promise<Building> The loaded building data
   */
  async loadBuilding(buildingId: string): Promise<Building> {
    try {
      return await this.roomRepository.loadBuilding(buildingId);
    } catch (error) {
      console.error('Error loading building:', error);
      throw new Error(`Failed to load building: ${error.message}`);
    }
  }

  /**
   * Lists all available buildings
   * @returns Promise<string[]> Array of building IDs
   */
  async listBuildings(): Promise<string[]> {
    try {
      return await this.roomRepository.listBuildings();
    } catch (error) {
      console.error('Error listing buildings:', error);
      throw new Error(`Failed to list buildings: ${error.message}`);
    }
  }
} 