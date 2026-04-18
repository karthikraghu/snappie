export interface ItemStats {
  power: number;
  defense: number;
  magic: number;
  durability: number;
}

export interface RPGItem {
  name: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  type: string;
  stats: ItemStats;
  lore: string;
  specialAbility: string;
  imageUrl?: string;
  generatedArtUrl?: string; // High-quality AI art generated in specific style
  style?: string; // The style chosen by the user (e.g. Pokemon, Pixar)
}

export type ItemStatus = "uploading" | "processing" | "completed" | "failed";

export interface ItemDocument {
  id: string;
  userId: string;
  status: ItemStatus;
  originalImageUrl: string;
  detectedObject?: string;
  visionLabels?: string[];
  item?: RPGItem;
  narrationAudioUrl?: string;
  style?: string; // Saved style preference
  createdAt: string;
  completedAt?: string;
  error?: string;
}
