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

export default function SnapPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [phase, setPhase] = useState<"camera" | "processing" | "reveal">("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [mockItem, setMockItem] = useState<ItemDocument | null>(null);
  
  // Track specific item processing state for polling
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleSnap = async (imgUrl: string, style: string) => {
    setCapturedImage(imgUrl);
    setPhase("processing");
    
    if (!user) return; // Normally Auth handles this
    
    try {
      // 1. Post to Upload Mock API
      const fd = new FormData();
      fd.append("image", imgUrl); // Passing data URL for mock simplicity
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
      setPhase("camera"); // Reset on error
      alert("Failed to initiate forge.");
    }
  };

  // 2. Client Side Polling
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
              setProcessingId(null); // Stop polling
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
      }, 2000); // Poll every 2 seconds
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
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 mb-6 border-4 border-black bg-retro-pink animate-spin-slow retro-shadow-sm flex items-center justify-center">
              <Layers size={48} />
            </div>
            <h2 className="text-3xl font-heading mb-2">FORGING...</h2>
            <p className="font-sans font-bold text-lg animate-pulse">Contacting Google Cloud...</p>
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
