import { Audit } from "./Audit";

export interface Floor extends Audit {
  buildingId: string;  // Reference to parent Building
  number: number;
  isWheelchairAccessible: boolean;
  hasElevatorAccess: boolean;
  hasRampAccess: boolean;
  roomIds: string[];   // One-to-many with Room
  floorplanId: string; // One-to-one with Floorplan
}

export interface Floorplan extends Audit {
  data: {};
}

export interface Room extends Audit {
  floorplanLocation: string;   // Reference to Floorplan Location
  number: string;
  type: string;
}
