import { GoogleGenAI, Type } from '@google/genai';
import { RPGItem } from '../types';

let _ai: GoogleGenAI | null = null;

const STYLE_PROMPTS: Record<string, string> = {
  pokemon: `Transform the object into a polished Pokémon-style fantasy item illustration. Preserve the core silhouette and most recognizable physical features of the original object, but redesign it to feel like it belongs in the Pokémon universe. Use clean, appealing shapes, simplified but expressive detailing, bright readable colors, smooth cel-shaded rendering, and charming stylized proportions. Make the design feel iconic, toyetic, and instantly recognizable, with a magical or elemental twist that matches the object’s form. The composition should be centered and clear, like official creature or item promotional artwork, with a soft minimal background or subtle themed environment. High visual clarity, polished anime-game illustration, no text, no labels, no watermark, no clutter.`,
  pixar: `Transform the object into a Pixar-style 3D fantasy item render. Preserve the original object’s silhouette and key identifiable features, but reinterpret it as a charming cinematic fantasy artifact with rounded appealing forms, believable materials, and expressive design language. Use soft but detailed 3D shading, rich global illumination, subtle surface imperfections, clean stylization, and warm cinematic lighting. Make it feel like a hero prop from an animated feature film, with strong readability, emotional charm, and polished studio-quality rendering. Place it in a simple cinematic presentation setting with depth, soft shadows, and elegant focus on the object. Ultra-clean composition, premium animated-film look, no text, no watermark, no labels, no unnecessary background clutter.`,
  ghibli: `Transform the object into a Studio Ghibli-inspired fantasy artifact. Preserve the original object’s recognizable shape and proportions, but reinterpret it with whimsical handcrafted charm, soft painterly textures, and a magical everyday-world feeling. Use gentle natural colors, delicate shading, storybook atmosphere, and subtle weathered detail as if the item has lived in a warm fantasy world. The design should feel soulful, nostalgic, and quietly enchanted rather than aggressive or overly glossy. Present it with soft ambient lighting and a lightly detailed background that suggests a peaceful fantasy setting without distracting from the object. Hand-painted anime-film aesthetic, poetic and warm, no text, no labels, no watermark.`,
  cyberpunk: `Transform the object into a cyberpunk fantasy-tech artifact. Preserve the original object’s silhouette and recognizable structure, but redesign it as a high-tech neon-enhanced item with futuristic panels, metallic surfaces, glowing accents, holographic details, and layered industrial design. Use dramatic contrast, sharp materials, electric reflections, moody atmospheric lighting, and a bold palette of neon cyan, magenta, purple, and deep shadow tones. The object should feel rare, powerful, and engineered for a dystopian sci-fi world, while still clearly derived from the source object. Present it like a premium concept art hero prop with cinematic framing, volumetric glow, and a dark futuristic environment. Hyper-detailed, sleek, intense, no text, no labels, no watermark.`,
  lego: `Transform the object into a LEGO-style fantasy item build. Preserve the original object’s silhouette and main recognizable features, but reinterpret it as if it were constructed from real LEGO bricks and specialized LEGO elements. Emphasize studded surfaces, modular brick construction, toy-like geometry, clean color blocking, and playful but believable assembly details. The item should feel like an official premium LEGO fantasy set prop: charming, precise, tactile, and fun. Use bright clean lighting, crisp shadows, polished plastic material response, and a simple presentation background that highlights the brick-built form. Highly readable toy-photography or box-art-like composition, no text, no labels, no watermark, no human hands.`,
  rpg: `Transform the original object into a magical RPG artifact. Preserve its core silhouette, proportions, and most recognizable physical traits, but reinterpret it as a high-fantasy hero-shot item with magical material properties, ancient craftsmanship, and rarity-specific glow or effects.`
};

const SHARED_ENDING = `The object must remain the only main subject. Center composition. Full item visible. Highly polished. No text, no logo, no labels, no watermark, no cropped object, no extra objects unless necessary for presentation.`;

const getAIClient = () => {
  if (!_ai) {
    const project = process.env.GCP_PROJECT_ID;
    const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
    
    if (!project) {
      throw new Error("Missing GCP_PROJECT_ID for Vertex AI initialization.");
    }
    
    _ai = new GoogleGenAI({ 
      vertexai: true, 
      project, 
      location 
    });
  }
  return _ai;
};

export const GCPGemini = {
  
  generateRPGItem: async (imageBuffer: Buffer, style: string): Promise<RPGItem & { artPrompt: string }> => {
    const ai = getAIClient();
    
    const stylePrompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.rpg;

    const systemPrompt = `You are a legendary RPG item forge. You will be provided with an image of a real-world object and a requested artistic style.
Analyze the image carefully: note the object's proportions, colors, material (plastic, metal, organic), and any unique features.

Your task:
1. Identify what the object is.
2. Create a fantasy RPG item inspired by it that matches the requested STYLE aesthetic.
3. Generate a compelling backstory (lore).
4. Build a master prompt for Imagen 3 by combining these components:
   - Base Prompt: Create a single hero-shot fantasy item based on the uploaded real-world object. Preserve its core silhouette, proportions, and most recognizable physical traits, but transform it into a magical RPG artifact. Emphasize materials, craftsmanship, rarity, silhouette clarity, and collectible appeal.
   - Style Overlay: ${stylePrompt}
   - Quality Constraints: ${SHARED_ENDING}

Rules:
- Rarity: Common, Uncommon, Rare, Epic, Legendary.
- Stats: 0-100.
- artPrompt MUST be a single long string combining the Base, Style, and Quality components described above.
- The outcome must be pure JSON.`;

    const userPrompt = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: "image/jpeg"
      }
    };

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      contents: [userPrompt, "Generate the RPG item based on this image."],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            rarity: { type: Type.STRING },
            type: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: {
                power: { type: Type.INTEGER },
                defense: { type: Type.INTEGER },
                magic: { type: Type.INTEGER },
                durability: { type: Type.INTEGER }
              },
              required: ["power", "defense", "magic", "durability"]
            },
            lore: { type: Type.STRING },
            specialAbility: { type: Type.STRING },
            artPrompt: { type: Type.STRING, description: "Combined detailed prompt for Imagen 3" }
          },
          required: ["name", "rarity", "type", "stats", "lore", "specialAbility", "artPrompt"]
        }
      }
    });

    if (!response.text) throw new Error("Gemini returned no content");
    
    return JSON.parse(response.text) as RPGItem & { artPrompt: string };
  }
};
