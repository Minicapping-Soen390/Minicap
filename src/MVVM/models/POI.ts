import { Audit } from "./Audit";

export interface POI extends Audit {
  type: string;
  name: string;
  category: POICategory;
  description: string;
  location: string;
}

export enum POICategory {
  Restaurant = "restaurant",
  Cafe = "cafe",
  Bar = "bar",
  BATHROOM = "BATHROOM",
  LIBRARY = "LIBRARY",
}

