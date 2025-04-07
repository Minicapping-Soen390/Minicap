import { Audit } from "./Audit";

export interface User extends Audit {
    email?: string;
    password?: string;
    name?: string;
    calendarIds?: string[];
    currentLocationId?: string;
}

export interface Administrator extends User {
  dateGranted?: Date;
}
