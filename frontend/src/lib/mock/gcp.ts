import { RPGItem } from "../types";
import { MOCK_ITEMS } from "../mockData";

/**
 * Mocks the GCP Cloud SDK services.
 * Real implementations will use Node @google-cloud libraries.
 */

// Simulates a network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const MockGCP = {
  storage: {
    // Simulates uploading a Blob/File to GCS and returning a public URL
    uploadImage: async (fileBlob: Blob, itemId: string): Promise<string> => {
      await delay(500); 
      // For the mock, we can't easily host binary without building an endpoint, 
      // so we might just return the MOCK_ITEMS placeholder image. 
      // BUT we want user uploads to be persistent in demo, so we'll treat the frontend 
      // data URI logic cautiously. Best effort mock:
      return "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop"; 
    },
    uploadAudio: async (audioBuffer: any, itemId: string): Promise<string> => {
      await delay(300);
      return "mock_audio_path.mp3";
    }
  },

  vision: {
    detectObject: async (imageUrl: string) => {
      await delay(800);
      return {
        object: "Coffee Mug",
        labels: ["mug", "ceramic", "drinkware", "tableware"]
      };
    }
  },

  gemini: {
    generateRPGItem: async (detectedObject: string, labels: string[]): Promise<RPGItem> => {
      await delay(1500); // Simulate large LLM generation delay
      // Randomly pick a mock item
      const item = MOCK_ITEMS[Math.floor(Math.random() * MOCK_ITEMS.length)];
      return item;
    }
  },

  tts: {
    generateNarration: async (lore: string): Promise<any> => {
      await delay(800);
      return null; // Return empty buffer mock
    }
  }
};
