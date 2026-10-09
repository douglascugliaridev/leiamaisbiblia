import { redirect } from "next/navigation";
import { Flame, LogOut, Trophy } from "lucide-react";
import { hojeISO, usuarioAtual } from "@/lib/auth";
import { sair } from "@/lib/acoes-auth";
import { diasMarcados } from "@/lib/leituras";
import { blocosPorTema, TOTAL_DIAS } from "@/lib/plano";
import {
  diaDisponivel,
  melhorStreak,
  progresso,
  streakAtual,
  totalLidos,
} from "@/lib/progresso";
import { ItemDia } from "@/components/item-dia";
import { BotaoReiniciar } from "@/components/botao-reiniciar";
import { Logo } from "@/components/logo";
import { SeletorTema } from "@/components/seletor-tema";

// Depende da sessão do usuário e do progresso atual: nunca pré-renderiza.
export const instant = false;

export default async function PlanoPage() {
  const usuario = await usuarioAtual();
  if (!usuario) redirect("/login");

  const marcas = diasMarcados(usuario.id);
  const hoje = diaDisponivel(usuario.inicio_em, hojeISO());

  const lidos = totalLidos(marcas);
  const pct = progresso(marcas);
  const atual = streakAtual(marcas, hoje);
  const recorde = melhorStreak(marcas);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo variante="icone" tamanho={40} prioridade />
            <div>
              <h1 className="text-lg font-semibold leading-tight">
                Olá, {usuario.nome.split(" ")[0]}
              </h1>
              <p className="text-xs text-suave">
                {lidos === 0
                  ? "Comece pelo dia 1 quando quiser"
                  : lidos === TOTAL_DIAS
                    ? "Plano concluído. Glória a Deus!"
                    : `${TOTAL_DIAS - lidos} dias restantes`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SeletorTema />
            <form action={sair}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-linha px-3 py-1.5 text-xs font-medium text-suave transition hover:text-red-700"
              >
                <LogOut size={13} aria-hidden />
                Sair
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-linha bg-cartao p-5">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium text-suave">Seu progresso</span>
            <span className="text-sm font-semibold tabular-nums">
              {lidos}/{TOTAL_DIAS}
              <span className="ml-2 font-normal text-suave">{pct}%</span>
            </span>
          </div>

          <div
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-linha"
            role="progressbar"
            aria-valuenow={lidos}
            aria-valuemin={0}
            aria-valuemax={TOTAL_DIAS}
            aria-label="Dias lidos"
          >
            <div
              className="h-full rounded-full bg-feito transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <Flame size={15} aria-hidden className="text-marca-viva" />
              <span className="text-suave">Sequência:</span>
              <strong className="tabular-nums">
                {atual} {atual === 1 ? "dia" : "dias"}
              </strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Trophy size={15} aria-hidden className="text-marca-viva" />
              <span className="text-suave">Recorde:</span>
              <strong className="tabular-nums">
                {recorde} {recorde === 1 ? "dia" : "dias"}
              </strong>
            </span>
            <span className="text-suave">
              Dia {hoje} de {TOTAL_DIAS} liberado
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        {blocosPorTema().map((bloco) => (
          <section key={bloco.tema}>
            <h2 className="mb-3 flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wide text-marca">
              {bloco.tema}
              <span className="text-xs font-normal normal-case tracking-normal text-suave">
                dias {bloco.dias[0].dia}–{bloco.dias[bloco.dias.length - 1].dia}
              </span>
            </h2>

            <ul className="flex flex-col gap-2">
              {bloco.dias.map((dia) => (
                <ItemDia
                  key={dia.dia}
                  dia={dia}
                  diaDisponivel={hoje}
                  marcadoInicial={marcas.includes(dia.dia)}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="mt-10 border-t border-linha pt-6">
        <BotaoReiniciar />
      </footer>
    </div>
  );
}