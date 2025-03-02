import { Audit } from "@/models/Audit";
import uuid from 'react-native-uuid';

export abstract class BaseViewModel<T> {
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

    // Removed MongoDB-related methods: getDb, withCollection, and cleanup
}
