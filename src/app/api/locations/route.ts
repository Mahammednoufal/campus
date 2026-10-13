import { NextResponse } from "next/server";
import { PersistentStore } from "@/lib/data/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, parent_id, description } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required." },
        { status: 400 }
      );
    }

    const newLoc = PersistentStore.createLocation({
      institution_id: "inst-001",
      parent_id: parent_id || null,
      name: name.trim(),
      type: type,
      description: description?.trim() || null,
      is_active: true,
      qr_enabled: true,
    });

    return NextResponse.json({ success: true, location: newLoc }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create location." },
      { status: 500 }
    );
  }
}
