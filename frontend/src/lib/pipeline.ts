import { MockGCP } from "./mock/gcp";
import { MockDB } from "./mock/db";
import { ItemDocument, RPGItem } from "./types";

const USE_MOCKS = process.env.USE_MOCKS !== "false";

/**
 * Background pipeline logic executed by the Eventarc Webhook. 
 * Refactored for Multimodal Vision (Gemini) + Styled Generation (Imagen 3).
 */
export async function runItemProcessingPipeline(itemId: string, gcsUri: string, style: string = "Standard RPG") {
  try {
    console.log(`[Pipeline] Started for item: ${itemId} | Style: ${style} | Mode: ${USE_MOCKS ? 'MOCK' : 'LIVE'}`);

    let rpgItem: RPGItem & { artPrompt?: string }, audioUrl, generatedArtUrl;

    // 1. Idempotency: Verify the item hasn't already been processed
    if (!USE_MOCKS) {
      const { GCPFirestore } = await import("./gcp/firestore");
      const existingDoc = await GCPFirestore.getItem(itemId);
      if (!existingDoc || existingDoc.status === "completed") {
        console.log(`[Pipeline] Aborting: ${itemId} already completed or missing.`);
        return;
      }
    }

    if (USE_MOCKS) {
      // ==== MOCK ROUTE ====
      const mockResult = await MockGCP.gemini.generateRPGItem("Mysterious Object", ["mystic", "ancient"]);
      rpgItem = { ...mockResult, artPrompt: "A mock art prompt" };
      rpgItem.imageUrl = gcsUri;
      generatedArtUrl = gcsUri; // Use same for mock
      audioUrl = await MockGCP.storage.uploadAudio(Buffer.from("mock"), itemId);
      
    } else {
      // ==== LIVE GCP ROUTE ====
      const { GCPGemini } = await import("./gcp/gemini");
      const { GCPImagen } = await import("./gcp/imagen");
      const { GCPTTS } = await import("./gcp/tts");
      const { GCPStorage } = await import("./gcp/storage");
      const { GCPFirestore } = await import("./gcp/firestore");

      // A. Download original image for Gemini analysis
      const imageBuffer = await GCPStorage.downloadImage(gcsUri);

      // B. Multimodal Analysis & Item Forging
      // Gemini sees the image directly and generates the stats + Imagen art prompt
      const forgedData = await GCPGemini.generateRPGItem(imageBuffer, style);
      rpgItem = forgedData;
      rpgItem.imageUrl = gcsUri; // Keep reference to original photo
      rpgItem.style = style;

      // C. PARALLEL GENERATION: Art (Imagen) + Narration (TTS)
      console.log(`[Pipeline] Launching parallel generation for ${itemId}...`);
      
      const [artResult, audioBuffer] = await Promise.all([
        // Task 1: Generate Art
        (async () => {
          try {
            const buffer = await GCPImagen.generateCardArt(forgedData.artPrompt);
            const url = await GCPStorage.uploadImage(buffer.toString('base64'), `${itemId}/styled`);
            return url;
          } catch (e) {
            console.error("[Pipeline] Art generation failed:", e);
            return gcsUri; // Fallback to photo
          }
        })(),
        // Task 2: Generate Narration
        GCPTTS.generateNarration(rpgItem.lore)
      ]);

      generatedArtUrl = artResult;
      rpgItem.generatedArtUrl = generatedArtUrl;
      audioUrl = await GCPStorage.uploadAudio(audioBuffer, itemId);
      
      // D. Final Database Update
      const finalDoc: Partial<ItemDocument> = {
        status: "completed",
        item: rpgItem,
        narrationAudioUrl: audioUrl,
        completedAt: new Date().toISOString()
      };

      await GCPFirestore.updateItem(itemId, finalDoc);
    }

    console.log(`[Pipeline] Finished successfully for item: ${itemId}`);

  } catch (err: any) {
    console.error(`[Pipeline Error] ${itemId}:`, err);
    if (!USE_MOCKS) {
      const { GCPFirestore } = await import("./gcp/firestore");
      await GCPFirestore.updateItem(itemId, { 
        status: "failed", 
        error: err.message 
      });
    }
  }
}
