import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Calendar, Event } from "@/models/Calendar";
import { Audit } from "@/models/Audit";
import { CalendarRepository } from "@/repositories/CalendarRepository";
import { MMKVLoader, create } from "react-native-mmkv-storage";

export class CalendarViewModel extends BaseViewModel<Calendar> implements CalendarRepository {
    private readonly COLLECTION_NAME = "calendars";
    // Added MMKV storage instance for calendars collection
    private readonly calendarStorage = create(new MMKVLoader().initialize());

    protected mapToDTO(doc: any): Calendar {
      if (!doc) throw new Error(`Calendar Not Found`);
      
      return {
        _id: doc._id,
        eventIds: doc.eventIds || [],
        userIds: doc.userIds || [],
        ...doc.audit
      };
    }

    async connectGoogleCalendar(googleCalendarId: string, userId: string): Promise<Calendar> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async disconnectGoogleCalendar(calendarId: string): Promise<void> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async getGoogleCalendarEvents(calendarId: string): Promise<Event[]> {
        throw new Error("Not implemented: MongoDB removed");
    }

    async getUserConnectedCalendars(userId: string): Promise<Calendar[]> {
        throw new Error("Not implemented: MongoDB removed");
    }

}
