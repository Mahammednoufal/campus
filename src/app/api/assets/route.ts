import { NextResponse } from "next/server";
import { PersistentStore } from "@/lib/data/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, location_id, identifier } = body;

    if (!name || !type || !location_id) {
      return NextResponse.json(
        { error: "Name, type, and location_id are required." },
        { status: 400 }
      );
    }

    const newAsset = PersistentStore.createAsset({
      institution_id: "inst-001",
      location_id,
      name: name.trim(),
      type,
      identifier: identifier?.trim() || null,
      is_active: true,
      installed_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, asset: newAsset }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create asset." },
      { status: 500 }
    );
  }
}
