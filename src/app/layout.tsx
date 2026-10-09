import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ScriptTema } from "@/components/script-tema";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leia Mais Bíblia",
  description: "Acompanhe seu progresso na leitura da Bíblia em 67 dias",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full antialiased`}>
      <head>
        <ScriptTema />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}