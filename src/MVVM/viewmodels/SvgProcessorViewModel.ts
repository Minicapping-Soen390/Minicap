import { SvgProcessorService } from '../services/SvgProcessorService';
import { Building } from '../models/Room';
import { getErrorMessage } from '@/Shared/utils/generalUtils';
import { BaseViewModel } from './BaseViewModel';
import { RoomRepository } from '../repositories/RoomRepository';

// This ViewModel can be extended from BaseViewModel if it needs state management
export class SvgProcessorViewModel {
  private readonly svgProcessor: SvgProcessorService;
  private readonly roomRepository: RoomRepository;

  constructor() {
    // Cast to any to avoid TypeScript errors with getInstance()
    this.svgProcessor = (SvgProcessorService as any).getInstance();
    this.roomRepository = (RoomRepository as any).getInstance();
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
      throw new Error(`Failed to process SVG file: ${getErrorMessage(error)}`);
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
      throw new Error(`Failed to load building: ${getErrorMessage(error)}`);
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
      throw new Error(`Failed to list buildings: ${getErrorMessage(error)}`);
    }
  }
}