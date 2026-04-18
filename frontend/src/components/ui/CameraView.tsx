"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { RetroButton } from "./RetroButton";
import { Camera, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function CameraView({ onSnap }: { onSnap: (imageUrl: string, style: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("Standard RPG");

  const styles = [
    { id: "rpg", label: "Default" },
    { id: "pokemon", label: "Pokémon" },
    { id: "pixar", label: "Pixar" },
    { id: "ghibli", label: "Ghibli" },
    { id: "cyberpunk", label: "Cyberpunk" },
    { id: "lego", label: "LEGO" },
  ];

  const startCamera = useCallback(async () => {
    setError("");
    setPreviewFrame(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setError("Camera access denied or unavailable.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]); // Removed stream from dependencies, it caused infinite loops previously.

  const takeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setPreviewFrame(dataUrl);
        // Stop stream while previewing
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const retake = () => {
    setPreviewFrame(null);
    startCamera();
  };

  const forge = () => {
    if (previewFrame) {
      onSnap(previewFrame, selectedStyle);
    }
  };

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-4 border-black bg-white retro-shadow-sm m-4">
        <p className="text-xl font-bold mb-4">{error}</p>
        <RetroButton variant="warning" onClick={startCamera}>Try Again</RetroButton>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col bg-black border-4 border-black retro-shadow-lg overflow-hidden m-4 aspect-[3/4] max-h-[70vh]">
      {!previewFrame ? (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-0 right-0 flex justify-center z-10 px-4 overflow-x-auto gap-2 no-scrollbar pb-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStyle(s.id)}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase transition-all flex-shrink-0 border-2 border-black",
                  selectedStyle === s.id 
                    ? "bg-retro-pink text-white retro-shadow-xs" 
                    : "bg-white text-black"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
            <RetroButton 
              size="icon" 
              variant="warning" 
              className="rounded-full w-20 h-20 shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[6px]"
              onClick={takeSnapshot}
            >
              <Camera size={36} strokeWidth={2.5}/>
            </RetroButton>
          </div>
        </>
      ) : (
        <>
          <img src={previewFrame} alt="Preview" className="w-full h-full object-cover filter grayscale-0" />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-end p-8 gap-4">
            <div className="w-full flex gap-4">
              <RetroButton variant="secondary" className="flex-1 text-sm font-sans" onClick={retake}>
                <RefreshCw size={18} className="mr-2" /> Retake
              </RetroButton>
              <RetroButton variant="primary" className="flex-[2] text-lg" onClick={forge}>
                FORGE ITEM!
              </RetroButton>
            </div>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
