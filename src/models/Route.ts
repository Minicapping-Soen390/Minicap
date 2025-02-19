import { Audit } from "./Audit";

export interface Route extends Audit {
  accessible: boolean;
  segmentIds: string[];  // One-to-many with RouteSegment
}

export interface RouteSegment extends Audit {
  startPoint: Location;  // Can be indoor or outdoor location
  endPoint: Location;    // Can be indoor or outdoor location
  transportationMode: TransportationMode;
  usageCount: number;
  path?: GeoJSON.LineString | IndoorPath; // Either outdoor or indoor path
  order?: number;
}

export interface IndoorPath {
  nodeIds: string[];    // Sequence of indoor navigation nodes
  floorTransitions: FloorTransition[];
}

export interface FloorTransition {
  fromFloorId: string;
  toFloorId: string;
  transitionType: TransportationMode;
}

export enum TransportationMode {
  // Outdoor modes
  WALKING = "WALKING",
  WHEELCHAIR = "WHEELCHAIR",
  BICYCLE = "BICYCLE",
  CAR = "CAR",
  BUS = "BUS",
  METRO = "METRO",
  
  // Indoor modes
  ELEVATOR = "ELEVATOR",
  ESCALATOR = "ESCALATOR",
  STAIRS = "STAIRS",
}

