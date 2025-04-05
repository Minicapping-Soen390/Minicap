# SVG Floor Plan Processor

This module handles the extraction of room data from SVG floor plan files.

## Overview

The SVG processor extracts the following data from floor plan SVG files:
- Room coordinates
- Room labels
- Building information
- Floor information
- Additional metadata

## Data Structure

### Room Data
```typescript
interface Room {
  id: string;
  name: string;
  label: string;
  coordinates: Point[];
  floor: string;
  building: string;
  type: string;
  metadata?: {
    [key: string]: any;
  };
}
```

### Building Data
```typescript
interface Building {
  id: string;
  name: string;
  floors: string[];
  rooms: Room[];
}
```

## Usage

### Processing Floor Plans

To process all floor plan SVG files:

```bash
npm run process-floor-plans
```

This will:
1. Scan the `Resources/floor_plans` directory for SVG files
2. Process each file to extract room data
3. Store the extracted data in the database
4. Output processing results and any errors

### Programmatic Usage

```typescript
import { SvgProcessorViewModel } from '../viewmodels/SvgProcessorViewModel';

const viewModel = new SvgProcessorViewModel();

// Process a single SVG file
const building = await viewModel.processSvgFile('/path/to/floor-plan.svg');

// Load a building's data
const loadedBuilding = await viewModel.loadBuilding('building-id');

// List all processed buildings
const buildingIds = await viewModel.listBuildings();
```

## Data Validation

The processor includes validation for:
- Required fields
- Coordinate data integrity
- Room structure consistency
- Building data completeness

## Error Handling

The processor provides detailed error messages for:
- Invalid SVG files
- Missing required data
- Data structure inconsistencies
- File access issues

## Storage

Processed data is stored in JSON files in the `data` directory, with the following structure:
```
data/
  building-id.json
  building-id.json
  ...
```

Each file contains the complete building data, including all rooms and metadata. 