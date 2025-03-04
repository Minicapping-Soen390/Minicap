import { ObjectId } from "mongodb";
import { Audit } from "./Audit";

export interface Campus extends Audit {
  id: string;
  name: string;
  buildingIds: ObjectId[];
  outdoorLocation: string;
}
