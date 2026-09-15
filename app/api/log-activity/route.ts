import { NextRequest, NextResponse } from "next/server";
import { appendActivity } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, amount, category, notes } = body;

    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    await appendActivity({ type, amount, category, notes });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Failed" },
      { status: 500 },
    );
  }
}
