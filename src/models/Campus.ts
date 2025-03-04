import { Audit } from "./Audit";

export interface Campus extends Audit {
  id: string;
  name: string;
  buildingIds: string[];
  outdoorLocation: string;
}
