"use client";

import React, { useEffect, useState } from "react";
import { RetroCard } from "@/components/ui/RetroCard";
import { ItemDocument } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { Layers } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ItemDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/dashboard?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard", e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full items-center justify-center">
        <div className="w-16 h-16 border-4 border-black bg-retro-cyan animate-spin-slow retro-shadow-sm flex items-center justify-center">
          <Layers size={32} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full">
      <header className="p-4 flex items-center justify-center border-b-4 border-black bg-retro-cyan sticky top-0 z-10">
        <h1 className="text-2xl font-heading text-center">YOUR VAULT</h1>
      </header>

      <div className="p-4 flex flex-col gap-8 pb-8">
        {items.length === 0 && (
          <div className="border-4 border-black bg-white p-6 retro-shadow-lg text-center mt-10">
            <h2 className="font-heading text-xl mb-2 uppercase">Empty Vault</h2>
            <p className="font-sans font-bold text-gray-600">Snap some photos to uncover legendary artifacts!</p>
          </div>
        )}

        {items.map((doc, idx) => {
          if (doc.status !== "completed" || !doc.item) return null;
          return <RetroCard key={doc.id} item={doc} />;
        })}
      </div>
    </main>
  );
}
