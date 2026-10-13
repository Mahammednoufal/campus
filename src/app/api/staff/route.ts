import { NextResponse } from "next/server";
import { PersistentStore } from "@/lib/data/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, specialty, team_id } = body;

    if (!name || !specialty) {
      return NextResponse.json(
        { error: "Name and specialty are required." },
        { status: 400 }
      );
    }

    const newStaff = PersistentStore.createStaff({
      institution_id: "inst-001",
      team_id: team_id || null,
      name: name.trim(),
      phone: phone?.trim() || null,
      specialty: specialty,
      is_active: true,
    });

    return NextResponse.json({ success: true, staff: newStaff }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create staff member." },
      { status: 500 }
    );
  }
}
