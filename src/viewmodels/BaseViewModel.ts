import { Audit } from "@/models/Audit";
import uuid from 'react-native-uuid';

export abstract class BaseViewModel<T extends Audit> {
    // Removed MongoDB-related fields and constructor code

    // New helper method for generating IDs
    protected generateId(): string {
        return uuid.v4() as string;
    }

    /**
     * Maps MongoDB document to DTO
     * @param doc MongoDB document
     */
    protected abstract mapToDTO(doc: any): T;

    /**
     * Updates audit information
     * @param existingAudit Current audit data if exists
     * @param userId User making the change
     */
    protected abstract updateAudit(existingAudit: Partial<Audit> | null, userId: string): Promise<Audit>;

    // Removed MongoDB-related methods: getDb, withCollection, and cleanup
}
