"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { reiniciar } from "@/lib/acoes-leitura";

export function BotaoReiniciar() {
  const [confirmando, setConfirmando] = useState(false);
  const [pendente, iniciar] = useTransition();

  function confirmar() {
    iniciar(async () => {
      await reiniciar();
      setConfirmando(false);
    });
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-linha px-3 py-1.5 text-xs font-medium text-suave transition hover:border-red-300 hover:text-red-700"
      >
        <RotateCcw size={13} aria-hidden />
        Reiniciar plano
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
      <span className="text-xs text-red-800">
        Apagar todo o progresso e recomeçar hoje?
      </span>
      <button
        type="button"
        onClick={confirmar}
        disabled={pendente}
        className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
      >
        {pendente ? "Reiniciando…" : "Sim, reiniciar"}
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        disabled={pendente}
        className="rounded-md px-2.5 py-1 text-xs font-medium text-red-800 underline disabled:opacity-60"
      >
        Cancelar
      </button>
    </div>
  );
}