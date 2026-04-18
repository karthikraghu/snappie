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

      // C. Generate Styled Art Asset (Imagen 3)
      console.log(`[Pipeline] Generating ${style} art for ${itemId}...`);
      try {
        const artBuffer = await GCPImagen.generateCardArt(forgedData.artPrompt);
        generatedArtUrl = await GCPStorage.uploadImage(artBuffer.toString('base64'), `${itemId}/styled`);
        rpgItem.generatedArtUrl = generatedArtUrl;
      } catch (imgError) {
        console.error("[Pipeline] Imagen failed, falling back to original photo:", imgError);
        rpgItem.generatedArtUrl = gcsUri;
      }

      // D. TTS audio narration of the lore
      const audioBuffer = await GCPTTS.generateNarration(rpgItem.lore);
      audioUrl = await GCPStorage.uploadAudio(audioBuffer, itemId);
      
      // E. Final Database Update
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
