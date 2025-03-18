# Project Structure

## Environment Variables
Contained within a `.env` file in project root and in secrets in the Github Repo.

### Name Conventions
- `MONGO_URI`: MongoDB connection string
- `MAPS_API_KEY`: Google Maps API key

## Core Directories

### `/src`
Root directory for all source code.

### `/src/models`
Data contracts (interfaces) that define the shape of our data.
- Each model is a TypeScript interface
- Defines the structure of data objects (e.g., Building.ts, Floor.ts)
- No implementation logic, just type definitions
- Example: `Building.ts`, `Floor.ts`, `Route.ts`

### `/src/repositories`
API contracts and implementations for data access.
- Defines how to interact with external services/APIs
- Each repository implements BaseRepository interface
- Handles CRUD operations and custom data queries
- Example: `BuildingRepository.ts`, `FloorRepository.ts`

### `/src/viewmodels`
Business logic and state management.
- Implements the actual API calls defined in repositories
- Manages UI state and data transformations
- Handles loading states and errors
- Example: `NavigationViewModel.ts`, `BuildingViewModel.ts`

### `/src/components`
Reusable UI components.
- Shared components used across multiple screens
- Each component in its own directory with related files
- Example: `ThemedText.tsx`, `Loader.tsx`

### `/src/app`
Screen components and navigation.
- Main screens and navigation logic
- Uses Expo Router file-based routing
- Example: `(tabs)/Home.tsx`, `pages/Login.tsx`

### `/src/assets`
Static assets.
- Images, icons, and fonts
- Organized by type (images/, icons/, fonts/)

### `/src/hooks`
Custom React hooks.
- Shared logic between components
- Example: `useViewModel.ts`, `useThemeColor.ts`

### `/src/constants`
Shared constants and configuration.
- Colors, theme values, API endpoints
- Example: `Colors.ts`

## File Naming Conventions

1. Use PascalCase for:
   - Components: `ThemedText.tsx`
   - ViewModels: `NavigationViewModel.ts`
   - Interfaces: `LocationInterface.ts`

2. Use kebab-case for:
   - Configuration files: `tailwind.config.js`
   - Documentation: `folder-structure.md`

3. Use camelCase for:
   - Utility files: `utils.ts`
   - Hook files: `useViewModel.ts`

## Testing

Place test files in `__test__` directory:
- Mirror the source directory structure
- Name test files with `.test.tsx` suffix
- Example: `__test__/components/ThemedText.test.tsx`

## Documentation

Keep documentation in the wiki:
- Technical guides
- Architecture decisions
- Coding standards
- Example: `MVVM-guide.md`