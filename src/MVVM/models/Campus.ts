import { Audit } from "./Audit";

export interface Campus extends Audit {
  name?: string;
  buildingIds: string[];
  outdoorLocation: string;
}
