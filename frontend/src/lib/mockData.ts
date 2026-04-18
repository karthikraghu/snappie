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
}

export const MOCK_ITEMS: RPGItem[] = [
  {
    name: "Chalice of Eternal Warmth",
    rarity: "Legendary",
    type: "Artifact",
    stats: { power: 85, defense: 20, magic: 95, durability: 60 },
    lore: "Forged in the volcanic springs of Mount Kaldris, this chalice was once used by the Archmage Therion to brew potions of infinite warmth. Those who drink from it are said to never feel the cold again.",
    specialAbility: "Grants immunity to frost damage",
    imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Tome of the Forgotten Server",
    rarity: "Epic",
    type: "Spellbook",
    stats: { power: 60, defense: 10, magic: 100, durability: 40 },
    lore: "An ancient manuscript found deep within the mainframe cooling vents. It glows faintly with unhandled exceptions.",
    specialAbility: "Summons a cloud of obscuring metrics",
    imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop"
  },
  {
    name: "Boots of Haste",
    rarity: "Rare",
    type: "Footwear",
    stats: { power: 10, defense: 30, magic: 20, durability: 80 },
    lore: "Given to couriers of the High King. The scuff marks tell tales of a thousand journeys made before dawn.",
    specialAbility: "Increases movement speed by 40%",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop"
  }
];

export const generateMockItem = (): RPGItem => {
  return MOCK_ITEMS[0];
};
