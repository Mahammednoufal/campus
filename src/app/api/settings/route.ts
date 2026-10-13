import { NextResponse } from "next/server";
import { PersistentStore } from "@/lib/data/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { policies } = body;

    if (!Array.isArray(policies)) {
      return NextResponse.json(
        { error: "Invalid policies format. Expected array." },
        { status: 400 }
      );
    }

    const updated = policies.map((p: any) =>
      PersistentStore.updateSlaPolicy(p.id, {
        response_time_minutes: Number(p.response_time_minutes),
        resolution_time_minutes: Number(p.resolution_time_minutes),
      })
    );

    return NextResponse.json({ success: true, policies: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update SLA policies." },
      { status: 500 }
    );
  }
}
