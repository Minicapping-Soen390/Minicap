import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { User } from "@/models/User";
import { UserRepository } from "@/repositories/UserRepository";
import { Audit } from "@/models/Audit";

export class UserViewModel extends BaseViewModel<User> implements UserRepository {
    private readonly COLLECTION = "users";

    async findUserById(id: string): Promise<User> {
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

    async updateUser(id: string, data: Partial<User>, token: string): Promise<User> {
        throw new Error("Method not implemented: updateUser");
    }

    async deleteUser(id: string, token: string): Promise<void> {
        throw new Error("Method not implemented: deleteUser");
    }

    async findByEmail(email: string): Promise<User | null> {
        throw new Error("Method not implemented: findByEmail");
    }

    protected mapToDTO(doc: any): User {
        if (!doc) throw new Error('Document not found');
        return {
            _id: doc._id,
            ...doc,
            createdAtUTC: doc.createdAtUTC,
            updatedAtUTC: doc.updatedAtUTC,
            createdBy: doc.createdBy,
            updatedBy: doc.updatedBy
        } as User;
    }

    protected async updateAudit(existingAudit: Partial<Audit> | null, userId: string): Promise<Audit> {
        throw new Error("Method not implemented: updateAudit");
    }
}
