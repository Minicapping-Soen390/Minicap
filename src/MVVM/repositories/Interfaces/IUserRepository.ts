import { User } from "@/MVVM/models/User";

export interface IUserRepository {
  /**
   * Gets a user by their ID
   * @param userId - The ID of the user
   * @returns Promise resolving to the found user
   * @throws {NotFoundError} If user doesn't exist
   */
  getUserById(userId: string): Promise<User>;
  
  /**
   * Gets a user by their email address
   * @param email - The user's email address
   * @returns Promise resolving to the found user or null if not found
   */
  getUserByEmail(email: string): Promise<User | null>;
  
  /**
   * Creates a new user
   * @param userData - The user data
   * @returns Promise resolving to the created user
   * @throws {ValidationError} If user data is invalid
   * @throws {ConflictError} If email already exists
   */
  createUser(userData: Omit<User, 'id'>): Promise<User>;
  
  /**
   * Updates an existing user
   * @param userId - The ID of the user to update
   * @param updates - The updates to apply
   * @returns Promise resolving to the updated user
   * @throws {NotFoundError} If user doesn't exist
   */
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  
  /**
   * Authenticates a user with email and password
   * @param email - The user's email
   * @param password - The user's password
   * @returns Promise resolving to the authenticated user or null if authentication fails
   */
  authenticateUser(email: string, password: string): Promise<User | null>;
  
  /**
   * Deletes a user account
   * @param userId - The ID of the user to delete
   * @returns Promise resolving to boolean indicating success
   * @throws {NotFoundError} If user doesn't exist
   */
  deleteUser(userId: string): Promise<boolean>;
}
