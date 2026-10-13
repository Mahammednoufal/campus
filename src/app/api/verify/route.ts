import { NextResponse } from "next/server";
import { PersistentStore } from "@/lib/data/db";

export async function POST(request: Request) {
  try {
    const { token, verified, notes } = await request.json();
    const updated = PersistentStore.verifyByStudent(token, verified, notes);
    if (!updated) {
      return NextResponse.json({ error: "Invalid tracking token" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process verification" }, { status: 500 });
  }
}
