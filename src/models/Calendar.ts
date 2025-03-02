import { Audit } from "./Audit";

export interface Calendar extends Audit {
  eventIds: string[]; // One-to-many with Event
  userIds: string[]; // Many-to-many with User
}

export interface Event extends Audit {
  name: string;
  locationId: string;  // FK to Location
  locationType: 'outdoor' | 'floorplan';  // Discriminator field
  startTime: string;
  endTime: string;
  recurrence: {};
  calendarId: string;  // FK to Calendar
}

export interface Course extends Event, Audit {
  courseCode: string;
  description: string;
  prerequisites: string[];
}

