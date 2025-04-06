import { ICalendarRepository } from "./Interfaces/ICalendarRepository";
import { BaseRepository } from "./BaseRepository";

// Export the interface for backward compatibility
export { ICalendarRepository as CalendarRepository };

export class CalendarRepositoryImpl extends BaseRepository<any> implements ICalendarRepository {
  async connectGoogleCalendar(googleCalendarId: string, userId: string): Promise<any> {
    throw new Error("Method not implemented: connectGoogleCalendar");
  }

  async getGoogleCalendarEvents(calendarId: string): Promise<any[]> {
    throw new Error("Method not implemented: getGoogleCalendarEvents");
  }

  async getUserConnectedCalendars(userId: string): Promise<any[]> {
    throw new Error("Method not implemented: getUserConnectedCalendars");
  }
}
