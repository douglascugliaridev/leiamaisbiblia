"use client";

import { useState, useTransition } from "react";
import { Check, Lock } from "lucide-react";
import { alternarDia } from "@/lib/acoes-leitura";
import { linkDaPassagem, type Dia } from "@/lib/plano";

export function ItemDia({
  dia,
  diaDisponivel,
  marcadoInicial,
}: {
  dia: Dia;
  diaDisponivel: number;
  marcadoInicial: boolean;
}) {
  const [marcado, setMarcado] = useState(marcadoInicial);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();

  const bloqueado = dia.dia > diaDisponivel;
  const ehHoje = dia.dia === diaDisponivel;

  function alternar() {
    if (bloqueado || pendente) return;
    const anterior = marcado;

    // atualização otimista: o check responde na hora e volta se o servidor negar
    setMarcado(!anterior);
    setErro(null);

    iniciar(async () => {
      const resposta = await alternarDia(dia.dia);
      if (!resposta.ok) {
        setMarcado(anterior);
        setErro(resposta.erro);
        return;
      }
      setMarcado(resposta.lido);
    });
  }

  return (
    <li className="flex items-start gap-3 rounded-xl border border-linha bg-cartao p-3">
      <button
        type="button"
        onClick={alternar}
        disabled={bloqueado || pendente}
        aria-pressed={marcado}
        aria-label={`Dia ${dia.dia}: ${dia.passagens.map((x) => x.ref).join(", ")}${
          marcado ? " — marcado como lido" : ""
        }`}
        title={
          bloqueado
            ? `Disponível em ${dia.dia - diaDisponivel} ${
                dia.dia - diaDisponivel === 1 ? "dia" : "dias"
              }`
            : undefined
        }
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${
          marcado
            ? "border-feito bg-feito text-white"
            : bloqueado
              ? "border-linha bg-fundo text-suave/50"
              : "border-linha bg-fundo hover:border-marca"
        } ${pendente ? "opacity-60" : ""}`}
      >
        {marcado ? (
          <Check size={17} strokeWidth={3} aria-hidden />
        ) : bloqueado ? (
          <Lock size={13} aria-hidden />
        ) : null}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className={`text-xs font-semibold tabular-nums ${
              marcado ? "text-feito" : "text-suave"
            }`}
          >
            Dia {dia.dia}
          </span>
          {ehHoje && (
            <span className="rounded-full bg-marca-suave px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-marca">
              hoje
            </span>
          )}
        </div>

        <p
          className={`mt-0.5 text-sm leading-snug ${
            bloqueado ? "text-suave/70" : "font-medium text-tinta"
          }`}
        >
          {dia.passagens.map((passagem, i) => (
            <span key={passagem.url}>
              {i > 0 && " · "}
              {bloqueado ? (
                // dia ainda não aberto: mostrar como texto puro evita
                // sugerir um link que não funciona
                passagem.ref
              ) : (
                <a
                  href={linkDaPassagem(passagem.url)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline decoration-linha underline-offset-2 hover:decoration-marca"
                >
                  {passagem.ref}
                </a>
              )}
            </span>
          ))}
        </p>

        {dia.temaDia && (
          <p className="mt-0.5 text-xs italic text-suave">{dia.temaDia}</p>
        )}

        {erro && <p className="mt-1 text-xs text-red-600">{erro}</p>}
      </div>
    </li>
  );
}