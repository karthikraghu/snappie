import { NextResponse } from "next/server";
import { MockDB } from "@/lib/mock/db";
import { runItemProcessingPipeline } from "@/lib/pipeline";
import crypto from "crypto";

const USE_MOCKS = process.env.USE_MOCKS !== "false";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageBlob = formData.get("image") as Blob;
    const userId = formData.get("userId") as string;
    const style = (formData.get("style") as string) || "Standard RPG";

    if (!imageBlob || !userId) {
      return NextResponse.json({ error: "Missing image or userId" }, { status: 400 });
    }

    const itemId = crypto.randomUUID();

    // 1. Validate Target Store
    let gcsUri = "mock_uri_ignore";
    let publicUrl = "mocked";
    
    if (typeof imageBlob === 'string') {
        publicUrl = imageBlob;
    }

    if (!USE_MOCKS && typeof imageBlob === 'string') {
      const { GCPStorage } = await import("@/lib/gcp/storage");
      gcsUri = `gs://${process.env.GCS_UPLOAD_BUCKET || 'snappie-uploads'}/${itemId}/original.jpg`;
      // GCPStorage.uploadImage now must be adjusted to return the GCS URI or just assume it.
      publicUrl = await GCPStorage.uploadImage(imageBlob, itemId);
    }

    // 2. Commit Processing State to Database
    const doc = {
      id: itemId,
      userId,
      style,
      status: "processing" as const,
      originalImageUrl: publicUrl,
      createdAt: new Date().toISOString(),
    };

    if (USE_MOCKS) {
      await MockDB.createItem(doc);
    } else {
      const { GCPFirestore } = await import("@/lib/gcp/firestore");
      await GCPFirestore.createItem(doc);
    }

    // 3. Local Development Webhook Simulator
    // In production, Eventarc sees the newly uploaded file and triggers the webhook automatically.
    // Locally, we mock the Eventarc POST request so your development flow remains uninterrupted.
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Dev Loop] Firing Mock Eventarc Webhook for ${itemId}...`);
      fetch(`http://localhost:3000/api/webhook/gcs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Ce-Type': 'google.cloud.storage.object.v1.finalized'
        },
        // We simulate the bare minimum CloudEvent structure
        body: JSON.stringify({
            name: `${itemId}/original.jpg`, // Key structure the worker expects
            bucket: process.env.GCS_UPLOAD_BUCKET || 'snappie-uploads',
            style // Pass the selection to the webhook simulator
        })
      }).catch(e => console.error("Simulated Eventarc completely failed:", e));
    }

    // Return immediately to frontend indicating Processing began successfully
    return NextResponse.json({ itemId, status: "processing" });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
