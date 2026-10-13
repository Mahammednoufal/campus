import { NextResponse } from "next/server";
import { PersistentStore } from "@/lib/data/db";

export async function GET(request: Request) {
  const data = PersistentStore.getAll();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
