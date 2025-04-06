import { SvgProcessorViewModel } from '../viewmodels/SvgProcessorViewModel';
import * as path from 'path';

async function testSvgProcessing() {
  try {
    console.log('Starting SVG processing test...');
    
    // Initialize the view model
    const viewModel = new SvgProcessorViewModel();
    
    // Test listing buildings (should be empty initially)
    console.log('\n1. Testing initial building list:');
    const initialBuildings = await viewModel.listBuildings();
    console.log('Initial buildings:', initialBuildings);
    
    // Process the SVG file
    const svgPath = path.join(__dirname, '..', 'data', 'svgFloorMaps', 'h8.svg');
    console.log('\n2. Processing SVG file:', svgPath);
    const building = await viewModel.processSvgFile(svgPath);
    
    // Display building information
    console.log('\n3. Building Information:');
    console.log('Name:', building.name);
    console.log('ID:', building.id);
    console.log('Floors:', building.floors);
    console.log('Total Rooms:', building.rooms.length);
    console.log('Dimensions:', building.metadata?.dimensions);
    
    // Display sample room information
    if (building.rooms.length > 0) {
      const sampleRoom = building.rooms[0];
      console.log('\n4. Sample Room Information:');
      console.log('Name:', sampleRoom.name);
      console.log('Label:', sampleRoom.label);
      console.log('Type:', sampleRoom.type);
      console.log('Number:', sampleRoom.roomNumber);
      console.log('Coordinates:', sampleRoom.coordinates);
      console.log('Bounding Box:', sampleRoom.boundingBox);
      console.log('Center:', sampleRoom.center);
      console.log('Search Terms:', sampleRoom.searchTerms);
    }
    
    // Test room search
    console.log('\n5. Testing Room Search:');
    const searchResults = await viewModel.searchRooms('hall');
    console.log('Search Results:', searchResults.length, 'rooms found');
    if (searchResults.length > 0) {
      console.log('First Result:', searchResults[0].name);
    }
    
    // Test data persistence
    console.log('\n6. Testing Data Persistence:');
    const loadedBuilding = await viewModel.getBuilding(building.id);
    console.log('Building loaded successfully:', loadedBuilding ? 'Yes' : 'No');
    if (loadedBuilding) {
      console.log('Loaded Building Name:', loadedBuilding.name);
      console.log('Loaded Building Rooms:', loadedBuilding.rooms.length);
    }
    
    // Test listing buildings again (should now include the processed building)
    console.log('\n7. Testing building list after processing:');
    const finalBuildings = await viewModel.listBuildings();
    console.log('Final buildings:', finalBuildings);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during SVG processing test:', error);
  }
}

// Run the test
testSvgProcessing(); 