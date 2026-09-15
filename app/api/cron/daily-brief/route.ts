import { NextRequest, NextResponse } from "next/server";
import { fetchTodayEvents } from "@/lib/calendar";
import { getActivities } from "@/lib/sheets";
import { generateBrief } from "@/lib/llm";
import { sendBriefing } from "@/lib/notify";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const isCron = req.headers.get("x-vercel-cron") === "true";
  const secret =
    req.headers.get("x-cron-secret") || url.searchParams.get("secret");

  if (!isCron && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await fetchTodayEvents();
    const activities = await getActivities(24);
    const brief = await generateBrief(events, activities);

    // Send via WhatsApp
    await sendBriefing(brief);

    return NextResponse.json({ ok: true, brief });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Failed" },
      { status: 500 },
    );
  }
}
