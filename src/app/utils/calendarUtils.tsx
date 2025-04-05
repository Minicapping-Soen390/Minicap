
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const fetchCalendarEvents = async () => {
  try {
    const tokens = await GoogleSignin.getTokens();
    const accessToken = tokens.accessToken;

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(8, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 0, 0, 0);

    const response = await axios.get(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          singleEvents: true,
          orderBy: "startTime",
        },
      }
    );

    const allEvents = response.data.items;

    const classEvents = allEvents.filter(
      (event: any) =>
        event.location &&
        (event.location.startsWith("Sir George Williams Campus") ||
         event.location.startsWith("Loyola Campus"))
    );

    const formatDate = (dateTime: string) => {
      if (!dateTime) return "No Time Available";
      const date = new Date(dateTime);
      return date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const eventsData = classEvents.map((event: any) => ({
      id: event.id,
      summary: event.summary || "No Title",
      start: event.start?.dateTime,
      startFormatted: formatDate(event.start?.dateTime),
      end: event.end?.dateTime,
      endFormatted: formatDate(event.end?.dateTime),
      location: event.location || "No Location",
    }));

    await AsyncStorage.setItem("calendarEvents", JSON.stringify(eventsData));
    return eventsData;

  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }
};