import { SvgProcessorViewModel } from '../viewmodels/SvgProcessorViewModel';
import * as fs from 'fs';
import * as path from 'path';

async function processFloorPlans() {
  const viewModel = new SvgProcessorViewModel();
  const floorPlansDir = path.join(process.cwd(), 'Resources', 'floor_plans');
  
  try {
    // Get all SVG files
    const files = fs.readdirSync(floorPlansDir)
      .filter(file => file.endsWith('.svg'));

    console.log(`Found ${files.length} SVG files to process`);

    // Process each file
    for (const file of files) {
      const filePath = path.join(floorPlansDir, file);
      console.log(`Processing ${file}...`);

      try {
        const building = await viewModel.processSvgFile(filePath);
        console.log(`Successfully processed ${file}`);
        console.log(`Building: ${building.name}`);
        console.log(`Rooms found: ${building.rooms.length}`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }

    // Verify all buildings were processed
    const processedBuildings = await viewModel.listBuildings();
    console.log('\nProcessed Buildings:');
    processedBuildings.forEach(buildingId => {
      console.log(`- ${buildingId}`);
    });

  } catch (error) {
    console.error('Error processing floor plans:', error);
    process.exit(1);
  }
}

// Run the script
processFloorPlans(); 