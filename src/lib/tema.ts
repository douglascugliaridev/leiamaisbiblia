"use client";

import { useSyncExternalStore } from "react";

export type Tema = "claro" | "escuro" | "sistema";

const CHAVE = "tema";

/**
 * Store externa para o tema, fora do React porque tanto o seletor quanto o
 * logo observam a mesma fonte — e o script que roda antes da hidratação altera
 * a classe da raiz sem passar pelo React.
 */
const observadores = new Set<() => void>();

function temaDoStorage(): Tema {
  try {
    const v = localStorage.getItem(CHAVE);
    if (v === "claro" || v === "escuro" || v === "sistema") return v;
  } catch {
    // storage indisponível (modo privado): cai na preferência do sistema
  }
  return "sistema";
}

function sistemaEscuro(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Resolve o tema efetivo a partir da preferência salva e do sistema. */
function resolverEscuro(tema: Tema): boolean {
  return tema === "escuro" || (tema === "sistema" && sistemaEscuro());
}

function assinar(avisa: () => void): () => void {
  observadores.add(avisa);

  const mq = window.matchMedia("(prefers-color-scheme: dark)");

  // No modo "sistema" ninguém chama aplicarTema quando o usuário muda a
  // configuração do sistema operacional, então ajustamos a classe da raiz aqui.
  const aoMudarSistema = () => {
    if (temaDoStorage() === "sistema") {
      document.documentElement.classList.toggle("dark", sistemaEscuro());
    }
    avisa();
  };

  mq.addEventListener("change", aoMudarSistema);

  return () => {
    observadores.delete(avisa);
    mq.removeEventListener("change", aoMudarSistema);
  };
}

/** Lê o tema salvo. No servidor cai em "sistema", evitando divergir no HTML. */
export function useTema(): Tema {
  return useSyncExternalStore(assinar, temaDoStorage, () => "sistema");
}

/**
 * O logo precisa da variante que combina com o fundo atual.
 *
 * O snapshot é recalculado a partir da preferência, e não da classe da raiz: se
 * confiássemos na classe, o tema "sistema" ficaria preso ao valor antigo quando
 * o usuário mudasse a configuração do sistema operacional.
 */
export function useTemaEscuro(): boolean {
  return useSyncExternalStore(
    assinar,
    () => resolverEscuro(temaDoStorage()),
    () => false,
  );
}

export function aplicarTema(tema: Tema): void {
  document.documentElement.classList.toggle("dark", resolverEscuro(tema));
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // sem persistência, o tema ainda vale para a sessão atual
  }

  for (const avisar of observadores) avisar();
}