import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const UPLOADS_BUCKET = process.env.GCS_UPLOAD_BUCKET || "snappie-uploads";
const ASSETS_BUCKET = process.env.GCS_ASSETS_BUCKET || "snappie-assets";

export const GCPStorage = {
  
  /**
   * Uploads a base64 Data URL to GCS.
   */
  uploadImage: async (dataUrl: string, itemId: string): Promise<string> => {
    const bucket = storage.bucket(UPLOADS_BUCKET);
    const fileName = `${itemId}/original.jpg`;
    const file = bucket.file(fileName);
    
    // Parse the Data URL (e.g. data:image/jpeg;base64,/9j/4AAQSkZJRg...)
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    await file.save(buffer, {
      metadata: { contentType: "image/jpeg" }
    });

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 Days
    });

    return signedUrl;
  },

  /**
   * Uploads raw MP3 Buffer to GCS.
   */
  uploadAudio: async (audioBuffer: Buffer, itemId: string): Promise<string> => {
    const bucket = storage.bucket(ASSETS_BUCKET);
    const fileName = `${itemId}/narration.mp3`;
    const file = bucket.file(fileName);

    await file.save(audioBuffer, {
      metadata: { contentType: "audio/mpeg" }
    });

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 Days
    });

    return signedUrl;
  },

  /**
   * Downloads a file from GCS into a Buffer.
   * Useful for passing files between AI models (Storage -> Gemini).
   */
  downloadImage: async (gcsUri: string): Promise<Buffer> => {
    // Extract bucket and name from gs://bucket/name
    const parts = gcsUri.replace("gs://", "").split("/");
    const bucketName = parts[0];
    const fileName = parts.slice(1).join("/");

    const [content] = await storage.bucket(bucketName).file(fileName).download();
    return content;
  }
};
