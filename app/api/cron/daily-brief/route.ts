import { NextRequest, NextResponse } from "next/server";
import { fetchTodayEvents } from "../../../../lib/calendar";
import { getActivities, getActivitiesBetween } from "../../../../lib/sheets";
import { generateDailyBrief, generateMonthlyBrief } from "../../../../lib/llm";
import { getPreviousMonthISTRange, getTodayIST } from "../../../../lib/date";
import { sendBriefing } from "../../../../lib/notify";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  const vercelCronSecret = req.headers.get("authorization");
  const customSecret =
    req.headers.get("x-cron-secret") || url.searchParams.get("secret");

  const isAuthorized =
    vercelCronSecret === `Bearer ${process.env.CRON_SECRET}` ||
    customSecret === process.env.CRON_SECRET;

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const events = await fetchTodayEvents();
    const last24HoursActivities = await getActivities(24);

    const dailyBrief = await generateDailyBrief(events, last24HoursActivities);

    const { day } = getTodayIST();

    let message = `☀️ Daily Briefing\n\n${dailyBrief}`;
    let monthlyBrief = "";

    // On the first day of the month, summarize the PREVIOUS full month.
    if (day === 1) {
      const { start, end, label } = getPreviousMonthISTRange();
      const previousMonthActivities = await getActivitiesBetween(start, end);

      monthlyBrief = await generateMonthlyBrief(label, previousMonthActivities);

      message += `\n\n📊 Monthly Summary — ${label}\n\n${monthlyBrief}`;
    }

    await sendBriefing(message);

    return NextResponse.json({
      ok: true,
      dailyBrief,
      monthlyBrief: monthlyBrief || null,
    });
  } catch (error: any) {
    console.error("daily-brief error:", error);

    return NextResponse.json(
      { error: error?.message || "Failed to generate briefing" },
      { status: 500 },
    );
  }
}
