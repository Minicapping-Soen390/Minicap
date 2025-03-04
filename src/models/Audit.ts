import { ObjectId } from "mongodb";

export interface Audit {
  _id: ObjectId; // MongoDB document ID
  createdAtUTC?: Date;
  updatedAtUTC?: Date;
  createdBy?: ObjectId;
  updatedBy?: ObjectId;
}
