# MVVM Guide: From Theory to Our Code 🚀

## What's MVVM?

Three key parts working together:
1. Models: Data structures
2. ViewModels: Business logic 
3. Views: UI components

## Deep Dive into Each Layer

### 1. Models & Why They Matter
Models are TypeScript interfaces that act as contracts for our data structures. Think of them as blueprints that everyone agrees to follow:
- They enforce data consistency across the app
- TypeScript catches mistakes at compile time
- Different teams can work independently knowing the data shape
- We can change data sources without breaking dependent code

### 2. Repositories (The "API Contracts" 🤝)
Repositories are interfaces that define HOW we interact with data sources:
- They abstract away the actual data access
- Make testing easier (we can swap real APIs for mocks)
- Create a clear contract between frontend and backend
- Allow us to change implementations without touching business logic

### 3. ViewModels (The "Brain" 🧠)
ViewModels are where the actual work happens:
- They implement repository interfaces
- Handle all business logic and data transformations
- Manage loading/error states
- Keep views updated with latest data

## The Pattern in Action

Here's how all pieces work together using a Building example:

### 1. Model (What our data looks like)
```typescript
interface Building extends Audit {
  name: string;  
  address: string;
  description: string;
  polygonShape?: any;  // Type TBD
  openingHours?: string;
  floors: string; 
  outdoorLocation: string; 
}
```

### 2. Repository Interface (How we access data)
```typescript
interface BuildingRepository {
  findBuildingById(id: string): Promise<Building>;
  findBuildingsByCampus(campusId: string): Promise<Building[]>;
  getAllBuildings(): Promise<Building[]>;
}
```

### 3. ViewModel (Business Logic)
```typescript
class BuildingViewModel extends BaseViewModel<Building> implements BuildingRepository {
  private readonly COLLECTION_NAME = "buildings";

  async findBuildingById(id: string): Promise<Building> {
    return this.withCollection(this.COLLECTION_NAME, async (collection) => {
      const doc = await collection.findOne({ _id: id });
      if (!doc) throw new Error(`Building with id ${id} not found`);
      return this.mapToDTO(doc);
    });
  }
  // ...other repository methods...
}
```


## Why This Pattern Rules 👑

1. **Type Safety & Interfaces**
   - TypeScript ensures data consistency
   - Interfaces define clear contracts
   - IDE support and autocomplete
   - Catch errors before they hit production

2. **Separation of Concerns**
   - Models: Pure data structures (no logic)
   - Repositories: Data access only (no business rules)
   - ViewModels: Business logic (no UI stuff)
   - Views: Pure UI (no business logic)

3. **Testability**
   - Mock repositories for unit tests
   - Test business logic in isolation
   - UI testing with fake data
   - Easy to set up test scenarios

## Best Practices 🔄

1. **Always handle loading and error states**
   - Users should never see blank screens
   - Clear error messages help debugging
   - Loading states improve UX

2. **Use repository interfaces**
   - Never access APIs directly from components
   - Keep data access patterns consistent
   - Makes testing and mocking easier

3. **Keep ViewModels focused**
   - One responsibility per ViewModel
   - Share logic through composition
   - Keep methods small and focused

4. **Leverage TypeScript**
   - Use strict mode
   - Define clear interfaces
   - Let the compiler catch errors

Pro Tips:
- Start with interfaces before implementation
- Write tests alongside new features
- Document your ViewModels
- Use dependency injection for better testing

Remember: The goal is maintainable, predictable code through clear separation of concerns! 🎉
