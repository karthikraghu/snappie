"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Grid, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

export function NavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href;
    return (
      <Link href={href} className="flex-1">
        <div className={cn(
          "flex flex-col items-center justify-center p-3 h-full border-r-4 border-black transition-colors",
          isActive ? "bg-retro-yellow font-bold" : "bg-white hover:bg-gray-100"
        )}>
          <Icon size={24} strokeWidth={isActive ? 3 : 2} className="mb-1" />
          <span className="text-xs uppercase font-sans font-bold">{label}</span>
        </div>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t-4 border-black z-50 flex items-stretch">
      <NavItem href="/" icon={Camera} label="Snap" />
      <NavItem href="/dashboard" icon={Grid} label="Vault" />
      
      <button 
        onClick={logout}
        className="flex-1 flex flex-col items-center justify-center p-3 h-full bg-white hover:bg-retro-pink transition-colors"
      >
        <LogOut size={24} strokeWidth={2} className="mb-1" />
        <span className="text-xs uppercase font-sans font-bold">Exit</span>
      </button>
    </nav>
  );
}
