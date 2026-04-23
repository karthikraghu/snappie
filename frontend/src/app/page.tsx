"use client";

import React, { useState, useEffect } from "react";
import { MOCK_ITEMS, RPGItem } from "@/lib/mockData";
import { ItemDocument } from "@/lib/types";
import { CameraView } from "@/components/ui/CameraView";
import { RetroCard } from "@/components/ui/RetroCard";
import { RetroButton } from "@/components/ui/RetroButton";
import { Layers, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";

const FORGE_LOGS = [
  "Analyzing molecular density...",
  "Decoding mana signature...",
  "Consulting the Great Forge...",
  "Infusing with legendary essence...",
  "Finalizing artifact metadata...",
  "Calculating rarity odds...",
  "Generating multi-modal assets..."
];

function ForgeStatusTicker() {
  const [logIndex, setLogIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % FORGE_LOGS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="font-sans font-bold text-xl text-gray-700 h-8 text-center animate-pulse uppercase tracking-tighter">
      {FORGE_LOGS[logIndex]}
    </p>
  );
}

export default function SnapPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [phase, setPhase] = useState<"camera" | "processing" | "reveal">("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [mockItem, setMockItem] = useState<ItemDocument | null>(null);
  
  // Track specific item processing state for polling
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- HELPER: Image Compression ---
  const compressImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% quality JPEG is plenty
      };
    });
  };

  const handleSnap = async (imgUrl: string, style: string) => {
    setPhase("processing");
    
    // 1. Optimize: Compress before upload
    const compressed = await compressImage(imgUrl);
    setCapturedImage(compressed);
    
    if (!user) return; 
    
    try {
      const fd = new FormData();
      fd.append("image", compressed); 
      fd.append("userId", user.id);
      fd.append("style", style);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: fd
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      setProcessingId(data.itemId);

    } catch (e) {
      console.error(e);
      setPhase("camera");
      alert("Failed to initiate forge.");
    }
  };

  // 2. Client Side Polling (Optimized to 1s)
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (phase === "processing" && processingId) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/item/${processingId}`);
          if (res.ok) {
            const itemDoc = await res.json();
            
            if (itemDoc.status === "completed") {
              setMockItem(itemDoc);
              setPhase("reveal");
              setProcessingId(null);
              clearInterval(intervalId);
            } else if (itemDoc.status === "failed") {
              setPhase("camera");
              clearInterval(intervalId);
              alert("Server failed to generate the item.");
            }
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 1000); // Poll every 1 second now
    }

    return () => clearInterval(intervalId);
  }, [phase, processingId]);


  const reset = () => {
    setCapturedImage(null);
    setMockItem(null);
    setPhase("camera");
    setProcessingId(null);
  };

  return (
    <main className="flex-1 flex flex-col max-w-md mx-auto w-full pb-20">
      
      {/* Header */}
      <header className="p-4 flex items-center justify-center border-b-4 border-black bg-white">
        <h1 className="text-2xl font-heading text-center">SNAPPIE</h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center overflow-y-auto p-4">
        {phase === "camera" && (
          <CameraView onSnap={handleSnap} />
        )}

        {phase === "processing" && (
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Particles */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-2 bg-retro-pink animate-float"
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            {/* Scanning Area */}
            <div className="relative w-64 h-64 border-8 border-black bg-white retro-shadow-lg overflow-hidden mb-8">
              {capturedImage && (
                <img src={capturedImage} alt="Scanning" className="w-full h-full object-cover" />
              )}
              {/* Laser Scanline */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-retro-green/50 to-transparent h-12 w-full animate-scan" style={{ borderTop: '4px solid #00ff00' }} />
            </div>

            <h2 className="text-4xl font-heading mb-4 text-center">FORGING...</h2>
            
            {/* Status Ticker */}
            <ForgeStatusTicker />
          </div>
        )}

        {phase === "reveal" && mockItem && (
          <div className="flex flex-col items-center py-4">
            <RetroCard item={mockItem} />
            <div className="w-full flex gap-4 mt-6 px-4">
              <RetroButton variant="secondary" onClick={reset} className="flex-1">
                <RefreshCw size={18} className="mr-2"/> AGAIN
              </RetroButton>
              <RetroButton variant="success" onClick={() => router.push('/dashboard')} className="flex-[2]">
                GO TO VAULT
              </RetroButton>
            </div>
          </div>
        )}
      </div>

    </main>
  );
}
