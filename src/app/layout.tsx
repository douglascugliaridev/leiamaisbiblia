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
    // suppressHydrationWarning: o ScriptTema acrescenta `dark` na raiz antes
    // da hidratação para evitar o flash de tela branca. O servidor não pode
    // saber a preferência do navegador, então essa classe diverge de propósito —
    // é o caso previsto pela documentação do React, corrigido aqui em vez de
    // aparecer como erro no console.
    <html
      lang="pt-BR"
      className={`${geist.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ScriptTema />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}