"use client";

import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { RetroButton } from "@/components/ui/RetroButton";
import { Sparkles } from "lucide-react";

export default function LoginPage() {
  const { loginAsGuest, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-retro-cyan">
      
      <div className="retro-shadow-lg bg-white border-4 border-black p-10 max-w-sm w-full mx-auto transform -rotate-2">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-retro-yellow border-4 border-black retro-shadow-sm flex items-center justify-center transform rotate-6">
            <Sparkles size={48} strokeWidth={2.5} />
          </div>
        </div>
        
        <h1 className="text-4xl mb-2 text-black">SNAPPIE</h1>
        <p className="font-sans mb-8 text-lg font-bold">
          Snap a photo. <br/> Get a legendary item.
        </p>

        <div className="flex flex-col gap-4">
          <RetroButton 
            variant="warning" 
            size="lg" 
            className="w-full text-xl"
            onClick={loginAsGuest}
          >
            LOGIN AS GUEST
          </RetroButton>
          <RetroButton 
            variant="secondary" 
            size="md" 
            className="w-full"
            disabled
          >
            GOOGLE LOGIN (SOON)
          </RetroButton>
        </div>
      </div>
      
    </main>
  );
}
