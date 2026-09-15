import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

type Activity = {
  timestamp: string;
  type: string;
  amount: string;
  category: string;
  notes: string;
};

export async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });

  return google.sheets({ version: "v4", auth });
}

async function getAllActivities(): Promise<Activity[]> {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
  const tabName = process.env.GOOGLE_SHEETS_TAB || "Activities";

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tabName}!A:E`,
  });

  const rows = response.data.values || [];

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => String(header).trim().toLowerCase());

  return rows.slice(1).map((row) => {
    const getValue = (name: string) => {
      const index = headers.indexOf(name);
      return index >= 0 ? String(row[index] || "").trim() : "";
    };

    return {
      timestamp: getValue("timestamp"),
      type: getValue("type"),
      amount: getValue("amount"),
      category: getValue("category"),
      notes: getValue("notes"),
    };
  });
}

export async function getActivities(lastHours = 24) {
  const cutoff = new Date(Date.now() - lastHours * 60 * 60 * 1000);
  const activities = await getAllActivities();

  return activities.filter((activity) => {
    const activityDate = new Date(activity.timestamp);
    return !Number.isNaN(activityDate.getTime()) && activityDate >= cutoff;
  });
}

export async function getActivitiesBetween(start: Date, end: Date) {
  const activities = await getAllActivities();

  return activities.filter((activity) => {
    const activityDate = new Date(activity.timestamp);

    return (
      !Number.isNaN(activityDate.getTime()) &&
      activityDate >= start &&
      activityDate < end
    );
  });
}

function parseAmount(amount: string) {
  // Supports values like 500, ₹500, 1,250, etc.
  const cleaned = amount.replace(/[^\d.-]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : 0;
}

export function getExpenseSummary(activities: Activity[]) {
  const bills = activities.filter(
    (activity) => activity.type.trim().toLowerCase() === "bill",
  );

  const total = bills.reduce((sum, bill) => sum + parseAmount(bill.amount), 0);

  const byCategory = bills.reduce<Record<string, number>>((result, bill) => {
    const category = bill.category || "Other";
    result[category] = (result[category] || 0) + parseAmount(bill.amount);
    return result;
  }, {});

  const sortedCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({ category, amount }));

  return {
    billCount: bills.length,
    total,
    categories: sortedCategories,
  };
}

export async function appendActivity(payload: {
  type: string;
  amount?: string;
  category?: string;
  notes?: string;
}) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
  const tabName = process.env.GOOGLE_SHEETS_TAB || "Activities";

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabName}!A:E`,
    valueInputOption: "RAW",
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          payload.type,
          payload.amount || "",
          payload.category || "",
          payload.notes || "",
        ],
      ],
    },
  });
}
