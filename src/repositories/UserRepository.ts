import { User } from "@/models/User";

export interface UserRepository {
  /**
   * Retrieves a user by their unique identifier
   * @param id - The string of the user to find
   * @returns Promise resolving to the found User
   * @throws {NotFoundError} If user doesn't exist
   */
  findUserById(id: string): Promise<User>;

  /**
   * Finds a user by their email address
   * @param email - The email to search for
   * @returns Promise resolving to the found User or null
   */
  findByEmail(email: string): Promise<User | null>;
}
