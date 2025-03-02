
export interface Audit {
    _id: string;  // MongoDB document ID
    createdAtUTC?: Date;
    updatedAtUTC?: Date;
    createdBy?: string;
    updatedBy?: string;
}