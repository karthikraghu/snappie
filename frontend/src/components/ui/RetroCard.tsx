import React from "react";
import { ItemDocument } from "@/lib/types";
import { Play } from "lucide-react";
import { RetroButton } from "./RetroButton";
import { cn } from "@/lib/utils";

const rarityColors = {
  Common: "bg-gray-300",
  Uncommon: "bg-retro-green",
  Rare: "bg-retro-cyan",
  Epic: "bg-retro-pink",
  Legendary: "bg-retro-yellow",
};

export function RetroCard({ item: doc }: { item: ItemDocument }) {
  const item = doc.item;

  if (!item) return null;
  
  const StatBar = ({ label, value }: { label: string, value: number }) => (
    <div className="flex flex-col mb-2">
      <div className="flex justify-between text-xs font-bold font-sans uppercase mb-1">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full h-4 bg-white border-2 border-black flex">
        <div 
          className="h-full bg-black transition-all duration-1000 ease-out" 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-sm bg-white border-4 border-black retro-shadow-lg flex flex-col p-4 relative overflow-hidden animate-in fade-in zoom-in duration-500">
      
      {/* Header / Rarity */}
      <div className={cn("text-center font-heading border-4 border-black py-2 mb-4 uppercase tracking-widest", rarityColors[item.rarity])}>
        ✦ {item.rarity} ✦
      </div>

      {/* Image Block */}
      {(item.generatedArtUrl || item.imageUrl) && (
        <div className="w-full aspect-square border-4 border-black mb-4 bg-gray-100 relative overflow-hidden retro-shadow-sm">
          <img 
            src={item.generatedArtUrl || item.imageUrl} 
            alt={item.name} 
            className="object-cover w-full h-full" 
          />
        </div>
      )}

      {/* Title */}
      <h2 className="text-2xl font-heading uppercase text-center mb-1 leading-none">{item.name}</h2>
      <p className="text-center font-sans text-sm font-bold uppercase mb-4 text-gray-600">Type: {item.type}</p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-x-4 mb-4">
        <StatBar label="Power" value={item.stats.power} />
        <StatBar label="Magic" value={item.stats.magic} />
        <StatBar label="Defense" value={item.stats.defense} />
        <StatBar label="Durab." value={item.stats.durability} />
      </div>

      {/* Special Ability */}
      <div className="bg-retro-yellow border-2 border-black p-2 mb-4 text-sm font-bold font-sans uppercase text-center">
        Ability: {item.specialAbility}
      </div>

      {/* Lore */}
      <div className="flex-1 bg-gray-100 border-2 border-black p-3 mb-4 max-h-32 overflow-y-auto">
        <p className="font-sans text-sm italic">"{item.lore}"</p>
      </div>

      {/* Audio Action */}
      {doc.narrationAudioUrl && (
        <RetroButton 
          variant="primary" 
          className="w-full mb-2 flex items-center justify-center gap-2"
          onClick={() => {
            const audio = new Audio(doc.narrationAudioUrl);
            audio.play().catch(e => console.error("Audio block", e));
          }}
        >
          <Play size={20} fill="currentColor" /> Play Narration
        </RetroButton>
      )}

    </div>
  );
}
