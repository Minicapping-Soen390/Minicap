import { User } from "@/MVVM/models/User";
import { IUserRepository } from "./Interfaces/IUserRepository";
import { BaseRepository } from "./BaseRepository";

// Export the interface for backward compatibility
export { IUserRepository as UserRepository };

export class UserRepositoryImpl extends BaseRepository<User> implements IUserRepository {
  async getUserById(userId: string): Promise<User> {
    throw new Error("Method not implemented: getUserById");
  }
  
  async getUserByEmail(email: string): Promise<User | null> {
    throw new Error("Method not implemented: getUserByEmail");
  }
  
  async createUser(userData: Omit<User, '_id'>): Promise<User> {
    throw new Error("Method not implemented: createUser");
  }
  
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    throw new Error("Method not implemented: updateUser");
  }
  
  async authenticateUser(email: string, password: string): Promise<User | null> {
    throw new Error("Method not implemented: authenticateUser");
  }
  
  async deleteUser(userId: string): Promise<boolean> {
    throw new Error("Method not implemented: deleteUser");
  }
}
