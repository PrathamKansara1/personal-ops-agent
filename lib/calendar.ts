import { google } from "googleapis";
import { getISTDayRange } from "./date";

const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

export async function getCalendarClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });

  return google.calendar({ version: "v3", auth });
}

export async function fetchTodayEvents() {
  const calendar = await getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";
  const { start, end } = getISTDayRange();

  const response = await calendar.events.list({
    calendarId,
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return (response.data.items || []).map((event) => ({
    summary: event.summary || "(No title)",
    start: event.start?.dateTime || event.start?.date || "",
    end: event.end?.dateTime || event.end?.date || "",
    location: event.location || "",
  }));
}
