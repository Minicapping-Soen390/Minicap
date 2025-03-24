import { Audit } from "./Audit";

export interface POI extends Audit {
  type: string;
  name: string;
  category: POICategory;
  description: string;
  location: string;
  campus?: string;
}

export enum POICategory {
  RESTAURANT = "RESTAURANT",
  COFFEE_SHOP = "COFFEE_SHOP",
  BATHROOM = "BATHROOM",
  LIBRARY = "LIBRARY",
  OTHER = "OTHER"
}

