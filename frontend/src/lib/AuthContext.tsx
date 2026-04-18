"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  isGuest: boolean;
}

interface AuthContextType {
  user: User | null;
  loginAsGuest: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loginAsGuest: () => {},
  logout: () => {},
  isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage for guest session on mount
    const storedUser = localStorage.getItem("snappie_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Protect routes
    if (!isLoading) {
      if (!user && pathname !== "/login") {
        router.push("/login");
      } else if (user && pathname === "/login") {
        router.push("/");
      }
    }
  }, [user, isLoading, pathname, router]);

  const loginAsGuest = () => {
    const newUser = { id: `guest_${Math.floor(Math.random() * 100000)}`, isGuest: true };
    setUser(newUser);
    localStorage.setItem("snappie_user", JSON.stringify(newUser));
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("snappie_user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loginAsGuest, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
