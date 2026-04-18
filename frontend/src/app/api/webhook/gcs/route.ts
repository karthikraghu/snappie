import { NextResponse } from "next/server";
import { runItemProcessingPipeline } from "@/lib/pipeline";

interface CloudEventBody {
  name: string; 
  bucket: string;
  style?: string;
}

/**
 * Endpoint designated for Google Cloud Eventarc.
 * Triggers sequentially when any `Upload` completes in a target Cloud Storage Bucket.
 */
export async function POST(req: Request) {
  try {
    // 1. Event Type Validation
    const eventType = req.headers.get("ce-type");
    if (eventType !== "google.cloud.storage.object.v1.finalized") {
      return NextResponse.json({ message: "Ignored event type" }, { status: 200 });
    }

    const payload: CloudEventBody = await req.json();

    // 2. Loop Prevention Strategies
    const expectedBucket = process.env.GCS_UPLOAD_BUCKET || "snappie-uploads";
    if (payload.bucket !== expectedBucket) {
      return NextResponse.json({ message: "Ignored bucket trigger" }, { status: 200 });
    }
    
    // We strictly search for our expected key schema. This prevents audio uploads from crashing the loop
    if (!payload.name.endsWith("/original.jpg")) {
      return NextResponse.json({ message: "Ignored derived file creation" }, { status: 200 });
    }

    // 3. Extract Item ID
    const itemId = payload.name.split("/")[0];
    const gcsUri = `gs://${payload.bucket}/${payload.name}`;
    const style = payload.style || "Standard RPG";

    console.log(`[Eventarc] Valid CloudEvent received for ${itemId} via ${gcsUri} | Style: ${style}`);

    // 4. Await the Pipeline
    // By awaiting this inside the Webhook POST frame, serverless architectures (Cloud Run / Vercel)
    // guarantee CPU scaling and lifecycle persistence until ML intelligence completes!
    await runItemProcessingPipeline(itemId, gcsUri, style);

    return NextResponse.json({ message: "Completed successfully" }, { status: 200 });

  } catch (error: any) {
    console.error("[Eventarc Webhook] Internal pipeline explosion:", error);
    // Returning a 500 code natively instructs Eventarc to initiate Exponential Backoff Retry rules!
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
