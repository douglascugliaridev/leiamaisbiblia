"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { aplicarTema, useTema, type Tema } from "@/lib/tema";

const OPCOES: Array<{ valor: Tema; rotulo: string; Icone: typeof Sun }> = [
  { valor: "claro", rotulo: "Claro", Icone: Sun },
  { valor: "escuro", rotulo: "Escuro", Icone: Moon },
  { valor: "sistema", rotulo: "Seguir o sistema", Icone: Monitor },
];

/** Alterna entre tema claro, escuro e o do sistema operacional. */
export function SeletorTema() {
  const tema = useTema();

  return (
    <div
      role="radiogroup"
      aria-label="Tema da interface"
      className="inline-flex items-center gap-0.5 rounded-lg border border-linha bg-cartao p-0.5"
    >
      {OPCOES.map(({ valor, rotulo, Icone }) => {
        const ativo = tema === valor;
        return (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            title={rotulo}
            onClick={() => aplicarTema(valor)}
            className={`rounded-md p-1.5 transition ${
              ativo
                ? "bg-marca-suave text-marca"
                : "text-suave hover:text-tinta"
            }`}
          >
            <Icone size={15} aria-hidden />
            <span className="sr-only">{rotulo}</span>
          </button>
        );
      })}
    </div>
  );
}