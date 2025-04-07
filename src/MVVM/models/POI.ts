import { Audit } from "./Audit";

export interface POI extends Audit {
  type?: string;
  name?: string;
  category?: POICategory;
  description?: string;
  location?: string;
}

export enum POICategory {
  RESTAURANT = "RESTAURANT",
  CAFE = "CAFE",
  BAR = "BAR",
  BATHROOM = "BATHROOM",
  LIBRARY = "LIBRARY",
}

