import { Audit } from "./Audit";

export interface Planner extends Audit {
  taskIDs: string[];
}

export interface Task extends Audit {
  description: string;
  locationId: string;  // FK to Location
  locationType: string;
  emergencyTask: boolean;
  needsDisplay: boolean;
  plannerId: string;   // FK to Planner
}
