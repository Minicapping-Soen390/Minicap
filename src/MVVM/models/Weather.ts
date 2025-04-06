import { Audit } from "./Audit";

export interface Weather extends Audit {
  date: Date;
  data: ForecastData;
}

export interface ForecastData extends Audit {
  data: any;
}

