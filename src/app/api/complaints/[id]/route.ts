import { NextResponse } from "next/server";
import { PersistentStore } from "@/lib/data/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolved = await params;
  const data = PersistentStore.getAll();
  const complaint = data.complaints.find((c) => c.id === resolved.id || c.ticket_id === resolved.id);
  if (!complaint) {
    return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  }
  return NextResponse.json(complaint, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolved = await params;
    const body = await request.json();
    const updated = PersistentStore.updateComplaint(resolved.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update complaint" }, { status: 500 });
  }
}
