import { ObjectId } from "mongodb";
import { Audit } from "./Audit";

export interface Location extends Audit {
  locationType: "outdoor" | "floorplan";
}

export interface FloorplanLocation extends Location {
  locationType: "floorplan";
  floorplanId: ObjectId;
  x: number;
  y: number;
}

export interface OutdoorLocation extends Location {
  locationType: "outdoor";
  latitude: number;
  longitude: number;
  latitudeDelta: number; // Added field
  longitudeDelta: number; // Added field
}
