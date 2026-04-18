import { GoogleGenAI } from '@google/genai';

let _ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!_ai) {
    const project = process.env.GCP_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';

    if (!project) {
      throw new Error("Missing GCP_PROJECT_ID for Vertex AI Imagen!");
    }
    
    _ai = new GoogleGenAI({ 
      vertexai: true,
      project,
      location 
    });
  }
  return _ai;
};

export const GCPImagen = {
  /**
   * Generates a high-quality card art asset based on Gemini's analyzed prompt.
   * Returns a Buffer of the generated image.
   */
  generateCardArt: async (prompt: string): Promise<Buffer> => {
    const ai = getAIClient();
    
    // Using Imagen 3.0 via the unified SDK
    // Model name might vary: imagen-3.0-generate-002 is common in Vertex, 
    // but in AI Studio it might be 'imagen-3' or similar.
    // We'll try a safe alias or the pinned version.
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "1:1",
        addWatermark: false
      }
    });

    const genImage = response.generatedImages ? response.generatedImages[0] : null;
    if (!genImage || !genImage.image || !genImage.image.imageBytes) {
      throw new Error("Imagen failed to generate image");
    }

    // imageBytes comes as base64 string from the SDK
    return Buffer.from(genImage.image.imageBytes, 'base64');
  }
};
