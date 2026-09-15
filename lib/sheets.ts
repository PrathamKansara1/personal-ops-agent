import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
];

export async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    },
    scopes: SCOPES,
  });

  const sheets = google.sheets({ version: "v4", auth });
  return sheets;
}

export async function getActivities(lastHours = 24) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
  const range = `${process.env.GOOGLE_SHEETS_TAB || "Activities"}!A:E`;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
  const rows = res.data.values || [];
  const header = rows[0] || [];
  const data = rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, i) => (obj[h] = r[i] || ""));
    return obj;
  });

  const cutoff = new Date(Date.now() - lastHours * 3600 * 1000).toISOString();
  return data.filter((d) => (d.timestamp || "") > cutoff);
}

export async function appendActivity(payload: {
  type: string;
  amount?: string;
  category?: string;
  notes?: string;
}) {
  const sheets = await getSheetsClient();
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
  const range = `${process.env.GOOGLE_SHEETS_TAB || "Activities"}!A:E`;

  const values = [
    [
      new Date().toISOString(),
      payload.type,
      payload.amount || "",
      payload.category || "",
      payload.notes || "",
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}
