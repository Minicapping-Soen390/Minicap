import { BaseViewModel } from "@/viewmodels/BaseViewModel";
import { Calendar, Event } from "@/models/Calendar";
import { CalendarRepository } from "@/repositories/CalendarRepository";

export class CalendarViewModel extends BaseViewModel<Calendar> implements CalendarRepository {
    protected mapToDTO(doc: any): Calendar {
        throw new Error("NotImplementedError: Operation not implemented");
    }
    private readonly COLLECTION_NAME = "calendars";

    async connectGoogleCalendar(googleCalendarId: string, userId: string): Promise<Calendar> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async disconnectGoogleCalendar(calendarId: string): Promise<void> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async getGoogleCalendarEvents(calendarId: string): Promise<Event[]> {
        throw new Error("NotImplementedError: Operation not implemented");
    }

    async getUserConnectedCalendars(userId: string): Promise<Calendar[]> {
        throw new Error("NotImplementedError: Operation not implemented");
    }
}
