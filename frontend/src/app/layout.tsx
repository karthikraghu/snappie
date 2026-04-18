// Since we replaced the top chunk and removed the metadata import by mistake previously
// Let's ensure layout.tsx is fully correct. I will just rewrite it cleanly!
import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import { NavBar } from "@/components/ui/NavBar";
import "./globals.css";

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-archivo-black",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snappie",
  description: "Snap a photo. Get a legendary item.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivoBlack.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-yellow-50 text-black font-sans selection:bg-yellow-300">
        <AuthProvider>
          <div className="flex-1 pb-16 flex flex-col">
            {children}
          </div>
          <NavBar />
        </AuthProvider>
      </body>
    </html>
  );
}
