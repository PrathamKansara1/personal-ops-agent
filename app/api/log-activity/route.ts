import { NextRequest, NextResponse } from "next/server";
import { appendActivity } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    console.log("Raw request body:", rawBody);

    if (!rawBody) {
      return NextResponse.json(
        { ok: false, error: "Request body is empty" },
        { status: 400 },
      );
    }

    let body: any;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "Request body is not valid JSON",
          received: rawBody,
        },
        { status: 400 },
      );
    }

    console.log("Parsed body:", body);

    const { type, amount, category, notes } = body;

    if (!type) {
      return NextResponse.json(
        {
          ok: false,
          error: "type is required",
          received: body,
        },
        { status: 400 },
      );
    }

    await appendActivity({
      type: String(type),
      amount: amount == null ? "" : String(amount),
      category: category == null ? "" : String(category),
      notes: notes == null ? "" : String(notes),
    });

    return NextResponse.json({
      ok: true,
      message: "Activity saved successfully",
      received: body,
    });
  } catch (error: any) {
    console.error("log-activity error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to save activity",
      },
      { status: 500 },
    );
  }
}
