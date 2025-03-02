export interface Audit {
    _id: string;  // MongoDB document ID
    createdAtUTC?: string;
    updatedAtUTC?: string;
    createdBy?: string;
    updatedBy?: string;
}