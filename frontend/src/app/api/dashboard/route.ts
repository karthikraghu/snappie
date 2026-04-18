import { NextResponse } from "next/server";
import { MockDB } from "@/lib/mock/db";

const USE_MOCKS = process.env.USE_MOCKS !== "false";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    let items;
    if (USE_MOCKS) {
      items = await MockDB.getItemsByUser(userId);
    } else {
      const { GCPFirestore } = await import("@/lib/gcp/firestore");
      items = await GCPFirestore.getItemsByUser(userId);
    }
    
    return NextResponse.json(items);

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
