import { Calendar, Event } from "@/MVVM/models/Calendar";

export interface ICalendarRepository {
  /**
   * Connects a Google Calendar to our system
   * @param googleCalendarId - The Google Calendar ID to connect
   * @param userId - The user connecting the calendar
   * @returns Promise resolving to the connected Calendar
   */
  connectGoogleCalendar(googleCalendarId: string, userId: string): Promise<Calendar>;
  /**
   * Gets events from a connected Google Calendar
   * @param calendarId - The string of our calendar entry
   * @returns Promise resolving to array of calendar events
   */
  getGoogleCalendarEvents(calendarId: string): Promise<Event[]>;
  /**
   * Lists all connected Google Calendars for a user
   * @param userId - The user whose calendars to list
   * @returns Promise resolving to array of connected Calendars
   */
  getUserConnectedCalendars(userId: string): Promise<Calendar[]>;
}
