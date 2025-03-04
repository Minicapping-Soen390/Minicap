import { Audit } from "./Audit";

export interface Location extends Audit {
  id: string;
  locationType: "outdoor" | "floorplan";
}

export interface FloorplanLocation extends Location {
  locationType: "floorplan";
  floorplanId: string;
  x: number;
  y: number;
}

export interface OutdoorLocation extends Location {
  locationType: "outdoor";
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
