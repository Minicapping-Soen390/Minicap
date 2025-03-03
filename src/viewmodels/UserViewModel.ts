import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { User } from "@/models/User";
import { UserRepository } from "@/repositories/UserRepository";

export class UserViewModel extends BaseViewModel<User> implements UserRepository {
    private readonly COLLECTION = "users";

    async findUserById(_id: string): Promise<User> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async signUp(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<{ user: User; token: string }> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async logout(token: string): Promise<void> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async updateUser(_id: string, data: Partial<User>, token: string): Promise<User> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async deleteUser(_id: string, token: string): Promise<void> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async findByEmail(email: string): Promise<User | null> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    protected mapToDTO(doc: any): User {
        throw new Error("NotImplementedError: Operation not implemented");
    }
}
