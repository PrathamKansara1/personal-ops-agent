import { GoogleGenerativeAI } from "@google/generative-ai";
import { getExpenseSummary } from "./sheets";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateDailyBrief(events: any[], activities: any[]) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
  });

  const expenseSummary = getExpenseSummary(activities);

  const eventsText = events
    .map((event) => {
      const time = event.start
        ? new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).format(new Date(event.start))
        : "All day";

      return `- ${time}: ${event.summary}${
        event.location ? ` (${event.location})` : ""
      }`;
    })
    .join("\n");

  const activitiesText = activities
    .map(
      (activity) =>
        `- ${activity.type} | ${activity.category || "Uncategorized"} | ${
          activity.amount ? `₹${activity.amount}` : "No amount"
        } | ${activity.notes || "No notes"}`,
    )
    .join("\n");

  const categoryText =
    expenseSummary.categories.length > 0
      ? expenseSummary.categories
          .map((item) => `- ${item.category}: ₹${item.amount}`)
          .join("\n")
      : "(No expenses logged in the last 24 hours)";

  const prompt = `
You are a personal operations assistant.

Create a concise daily morning briefing in plain text, with a maximum of 8 bullets.
Use simple language. Do not invent meetings, expenses, amounts, due dates, or advice based on facts not provided.

The briefing must include:
1. Today's calendar schedule, ordered by time.
2. Last 24 hours of recorded spending and activities.
3. Exact total spending in the last 24 hours: ₹${expenseSummary.total}.
4. Spending category breakdown.
5. One or two useful, practical action suggestions based only on the supplied information.

TODAY'S CALENDAR (IST):
${eventsText || "(No meetings or events scheduled today)"}

LAST 24 HOURS — EXPENSES AND ACTIVITIES:
${activitiesText || "(No bills or activities logged in the last 24 hours)"}

LAST 24 HOURS — SPENDING SUMMARY:
- Number of bills: ${expenseSummary.billCount}
- Total spent: ₹${expenseSummary.total}
- By category:
${categoryText}

Output only bullets. Do not add a heading.
`.trim();

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateMonthlyBrief(
  monthLabel: string,
  activities: any[],
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
  });

  const expenseSummary = getExpenseSummary(activities);

  const billsText = activities
    .filter((activity) => activity.type.trim().toLowerCase() === "bill")
    .map(
      (bill) =>
        `- ${bill.timestamp} | ${bill.category || "Other"} | ₹${
          bill.amount || "0"
        } | ${bill.notes || "No notes"}`,
    )
    .join("\n");

  const categoryText =
    expenseSummary.categories.length > 0
      ? expenseSummary.categories
          .map((item) => `- ${item.category}: ₹${item.amount}`)
          .join("\n")
      : "(No expenses were logged)";

  const prompt = `
You are a personal finance summary assistant.

Create a monthly spending report for ${monthLabel}.
Use plain text with a maximum of 10 bullets.
Do not invent income, savings, budget limits, trends, or financial facts that are not in the data.

Must include:
1. Total expenses: ₹${expenseSummary.total}
2. Number of bill entries: ${expenseSummary.billCount}
3. Category-wise spending, ordered highest to lowest.
4. The highest-spend category.
5. Up to two practical observations based strictly on the recorded data.
6. If there are no bill entries, clearly say no expenses were logged.

MONTH: ${monthLabel}

CALCULATED MONTHLY TOTAL:
₹${expenseSummary.total}

CATEGORY BREAKDOWN:
${categoryText}

ALL BILL RECORDS:
${billsText || "(No bills logged for this month)"}

Output only bullets. Do not add a heading.
`.trim();

  const result = await model.generateContent(prompt);
  return result.response.text();
}
