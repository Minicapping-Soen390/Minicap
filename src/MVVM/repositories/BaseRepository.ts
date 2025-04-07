/**
 * Base class for all repository implementations
 * Provides singleton pattern functionality
 */
export abstract class BaseRepository<T> {
  // Using protected static allows subclasses to have their own singleton instances
  protected static instances: Record<string, any> = {};

  // Protected constructor to prevent direct instantiation
  protected constructor() {}

  /**
   * Gets the singleton instance of the repository
   * @returns The singleton instance
   */
  public static getInstance<R extends BaseRepository<any>>(this: new () => R): R {
    const className = this.name;
    
    if (!BaseRepository.instances[className]) {
      BaseRepository.instances[className] = new this();
    }
    
    return BaseRepository.instances[className] as R;
  }

  /**
   * Clears the singleton instance (useful for testing)
   */
  public static clearInstance(className?: string): void {
    if (className) {
      delete BaseRepository.instances[className];
    } else {
      BaseRepository.instances = {};
    }
  }
}
