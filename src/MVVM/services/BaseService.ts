/**
 * Base class for all service implementations
 * Provides singleton pattern functionality
 */
export abstract class BaseService {
  // Using a private static map to store instances of each service class
  private static readonly instances = new Map<string, BaseService>();

  // Protected constructor to prevent direct instantiation
  protected constructor() {}

  /**
   * Gets the singleton instance of the service
   * Uses generic type inference to properly handle the return type
   */
  public static getInstance<T extends BaseService>(this: new () => T): T {
    const className = this.name;
    
    if (!BaseService.instances.has(className)) {
      // Create a new instance and store it in the map
      BaseService.instances.set(className, new this());
    }
    
    return BaseService.instances.get(className) as T;
  }

  /**
   * Clears the singleton instance (useful for testing)
   */
  public static clearInstance(): void {
    const className = this.name;
    if (BaseService.instances.has(className)) {
      BaseService.instances.delete(className);
    }
  }

  /**
   * Clears all service instances (useful for testing)
   */
  public static clearAllInstances(): void {
    BaseService.instances.clear();
  }
}
