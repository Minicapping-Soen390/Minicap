import { SvgProcessorViewModel } from '../viewmodels/SvgProcessorViewModel';
import { RoomRepository } from '../repositories/RoomRepository';
import * as fs from 'fs';
import * as path from 'path';

describe('SVG Processor', () => {
  let viewModel: SvgProcessorViewModel;
  let repository: RoomRepository;
  const testDataDir = path.join(process.cwd(), 'test-data');

  beforeEach(() => {
    // Create test data directory
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    repository = new RoomRepository(testDataDir);
    viewModel = new SvgProcessorViewModel();
  });

  afterEach(() => {
    // Clean up test data
    if (fs.existsSync(testDataDir)) {
      fs.rmSync(testDataDir, { recursive: true, force: true });
    }
  });

  test('should process SVG file and extract room data', async () => {
    const svgFilePath = path.join(process.cwd(), 'Resources', 'floor_plans', 'Hall-8.svg');
    
    const building = await viewModel.processSvgFile(svgFilePath);
    
    expect(building).toBeDefined();
    expect(building.id).toBeDefined();
    expect(building.name).toBeDefined();
    expect(building.rooms.length).toBeGreaterThan(0);
    
    // Verify room data structure
    const room = building.rooms[0];
    expect(room.id).toBeDefined();
    expect(room.name).toBeDefined();
    expect(room.coordinates.length).toBeGreaterThan(0);
    expect(room.floor).toBeDefined();
    expect(room.building).toBeDefined();
  });

  test('should validate room data structure', async () => {
    const svgFilePath = path.join(process.cwd(), 'Resources', 'floor_plans', 'Hall-8.svg');
    const building = await viewModel.processSvgFile(svgFilePath);
    
    const isValid = repository.validateBuilding(building);
    expect(isValid).toBe(true);
  });

  test('should store and retrieve building data', async () => {
    const svgFilePath = path.join(process.cwd(), 'Resources', 'floor_plans', 'Hall-8.svg');
    const building = await viewModel.processSvgFile(svgFilePath);
    
    // Store the building
    await repository.saveBuilding(building);
    
    // Retrieve the building
    const loadedBuilding = await repository.loadBuilding(building.id);
    
    expect(loadedBuilding).toBeDefined();
    expect(loadedBuilding.id).toBe(building.id);
    expect(loadedBuilding.rooms.length).toBe(building.rooms.length);
  });

  test('should handle invalid SVG files', async () => {
    const invalidSvgPath = path.join(testDataDir, 'invalid.svg');
    fs.writeFileSync(invalidSvgPath, '<svg>invalid content</svg>');
    
    await expect(viewModel.processSvgFile(invalidSvgPath))
      .rejects
      .toThrow();
  });

  test('should list all processed buildings', async () => {
    const svgFilePath = path.join(process.cwd(), 'Resources', 'floor_plans', 'Hall-8.svg');
    await viewModel.processSvgFile(svgFilePath);
    
    const buildings = await viewModel.listBuildings();
    expect(buildings.length).toBeGreaterThan(0);
    expect(buildings).toContain('hall-8');
  });
}); 