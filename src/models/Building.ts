import { Audit } from "./Audit";

export interface Building extends Audit {
  name: string;  
  address: string;
  description: string;
  polygonShape?: object;  // Type TBD (consider defining a specific type)
  openingHours?: string;
  floors: string[]; 
  outdoorLocation: string; 
}
