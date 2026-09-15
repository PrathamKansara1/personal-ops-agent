import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateBrief(events: any[], activities: any[]) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const eventsText = events
    .map(
      (e) =>
        `- ${e.summary} | ${new Date(e.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ${e.location ? "| " + e.location : ""}`,
    )
    .join("\n");

  const activitiesText = activities
    .map(
      (a) =>
        `- [${a.type}] ${a.category || ""} ${a.amount ? "| ₹" + a.amount : ""} | ${a.notes || ""}`,
    )
    .join("\n");

  const prompt = `
You are a personal ops assistant. Summarize the following into a concise morning briefing (max 8 bullets). 
Include: key meetings, travel/time blocks, bills/financial items due, and 1–2 action suggestions.

Today's calendar:
${eventsText || "(No events)"}

Recent bills/activities (last 24h):
${activitiesText || "(None)"}

Output as plain text bullets, no headings, no extra commentary.
`.trim();

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return text;
}
