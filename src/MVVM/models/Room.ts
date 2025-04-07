import { Audit } from "./Audit";

export interface Point {
  x?: number;
  y?: number;
}

export interface Dimensions {
  width?: number;
  height?: number;
}

export interface BoundingBox {
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
}

export interface Room extends Audit {
  name?: string;
  label?: string;
  coordinates?: Point[];
  floor?: string;
  building?: string;
  type?: string;
  // Search-friendly fields
  searchTerms: string[];
  roomNumber?: string;
  // UI-specific properties
  boundingBox?: BoundingBox;
  center?: Point;
  metadata?: {
    style?: {
      [key: string]: string;
    };
    [key: string]: any;
  };
}

export interface Building extends Audit {
  name?: string;
  floors: string[];
  rooms?: Room[];
  // UI-specific properties
  boundingBox?: BoundingBox;
  center?: Point;
  metadata?: {
    dimensions?: Dimensions;
    sourceFile?: string;
    lastModified?: string;
    [key: string]: any;
  };
}