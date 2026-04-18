import { NextResponse } from "next/server";
import { MockDB } from "@/lib/mock/db";

const USE_MOCKS = process.env.USE_MOCKS !== "false";

// Handle GET /api/item/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    let item;
    if (USE_MOCKS) {
      item = await MockDB.getItem(id);
    } else {
      const { GCPFirestore } = await import("@/lib/gcp/firestore");
      item = await GCPFirestore.getItem(id);
    }
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
