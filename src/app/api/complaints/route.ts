import { NextResponse } from "next/server";
import { PersistentStore } from "@/lib/data/db";

export async function GET(request: Request) {
  const data = PersistentStore.getAll();
  return NextResponse.json(data.complaints, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = PersistentStore.createComplaint(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create complaint" }, { status: 500 });
  }
}
