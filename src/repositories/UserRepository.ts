import { User } from "@/models/User";

export interface UserRepository {
  findUserById(id: ObjectId): Promise<User>;
  signUp(data: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<{ user: User; token: string }>;
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  logout(token: string): Promise<void>;
  updateUser(id: ObjectId, data: Partial<User>, token: string): Promise<User>;
  deleteUser(id: ObjectId, token: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

export interface UserRepository {
  /**
   * Retrieves a user by their unique identifier
   * @param id - The string of the user to find
   * @returns Promise resolving to the found User
   * @throws {NotFoundError} If user doesn't exist
   */
  findUserById(_id: string): Promise<User>;

  /**
   * Finds a user by their email address
   * @param email - The email to search for
   * @returns Promise resolving to the found User or null
   */
  findByEmail(email: string): Promise<User | null>;
}
