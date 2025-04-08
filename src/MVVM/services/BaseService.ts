/**
 * Base class for all service implementations
 * Provides singleton pattern functionality
 */
export abstract class BaseService {
  // Using protected static allows subclasses to have their own singleton instances
  protected static instances: Record<string, any> = {};

  // Protected constructor to prevent direct instantiation
  protected constructor() {}

  /**
   * Gets the singleton instance of the service
   * @returns The singleton instance
   */
  public static getInstance<S extends BaseService>(this: new () => S): S {
    const className = this.name;
    
    if (!BaseService.instances[className]) {
      BaseService.instances[className] = new this();
    }
    
    return BaseService.instances[className] as S;
  }

  /**
   * Clears the singleton instance (useful for testing)
   */
  public static clearInstance(className?: string): void {
    if (className) {
      delete BaseService.instances[className];
    } else {
      BaseService.instances = {};
    }
  }
}
