import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { User } from "@/models/User";
import { UserRepository } from "@/repositories/UserRepository";
import { MMKVLoader, create } from "react-native-mmkv-storage";

export class UserViewModel extends BaseViewModel<User> implements UserRepository {
    private readonly COLLECTION = "users";
    // Added MMKV storage instance for users collection
    private readonly userStorage = create(new MMKVLoader().initialize());

    async findUserById(_id: string): Promise<User> {
        throw new Error("Method not implemented: findUserById");
    }

    async signUp(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<{ user: User; token: string }> {
        throw new Error("Method not implemented: signUp");
    }

    async login(email: string, password: string): Promise<{ user: User; token: string }> {
        throw new Error("Method not implemented: login");
    }

    async logout(token: string): Promise<void> {
        throw new Error("Method not implemented: logout");
    }

    async updateUser(_id: string, data: Partial<User>, token: string): Promise<User> {
        throw new Error("Method not implemented: updateUser");
    }

    async deleteUser(_id: string, token: string): Promise<void> {
        throw new Error("Method not implemented: deleteUser");
    }

    async findByEmail(email: string): Promise<User | null> {
        throw new Error("Method not implemented: findByEmail");
    }

    protected mapToDTO(doc: any): User {
        if (!doc) throw new Error('Document not found');
        return {
            _id: doc._id,
            ...doc
        } as User;
    }
}
