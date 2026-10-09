import { TOTAL_DIAS, type Dia } from "./plano";

/** Diferença em dias inteiros entre duas datas no formato YYYY-MM-DD. */
export function diasEntre(inicio: string, fim: string): number {
  const [anoA, mesA, diaA] = inicio.split("-").map(Number);
  const [anoB, mesB, diaB] = fim.split("-").map(Number);
  const a = Date.UTC(anoA, mesA - 1, diaA);
  const b = Date.UTC(anoB, mesB - 1, diaB);
  return Math.round((b - a) / 86_400_000);
}

/**
 * Maior dia do plano liberado hoje, contando o dia do cadastro como dia 1.
 */
export function diaDisponivel(inicioEm: string, hoje: string): number {
  return Math.min(TOTAL_DIAS, diasEntre(inicioEm, hoje) + 1);
}

export function podeMarcar(
  dia: number,
  inicioEm: string,
  hoje: string,
): boolean {
  if (!Number.isInteger(dia) || dia < 1 || dia > TOTAL_DIAS) return false;
  return dia <= diaDisponivel(inicioEm, hoje);
}

/**
 * Maior sequência corrida de dias marcados terminando no dia de hoje.
 * Aceita que o usuário ainda não tenha lido hoje: se leu ontem, o streak segue
 * vivo até o fim do dia.
 */
export function streakAtual(diasMarcados: number[], hoje: number): number {
  const marcados = new Set(diasMarcados);
  let cursor = hoje;
  if (!marcados.has(cursor)) {
    cursor = hoje - 1;
    if (!marcados.has(cursor)) return 0;
  }
  let contador = 0;
  while (marcados.has(cursor)) {
    contador += 1;
    cursor -= 1;
  }
  return contador;
}

/** Maior sequência corrida em qualquer ponto do histórico. */
export function melhorStreak(diasMarcados: number[]): number {
  const ordenados = [...new Set(diasMarcados)].sort((a, b) => a - b);
  let melhor = 0;
  let atual = 0;
  let anterior = 0;
  for (const dia of ordenados) {
    atual = dia === anterior + 1 ? atual + 1 : 1;
    anterior = dia;
    if (atual > melhor) melhor = atual;
  }
  return melhor;
}

export function totalLidos(diasMarcados: number[]): number {
  return new Set(diasMarcados).size;
}

export function progresso(diasMarcados: number[]): number {
  return Math.round((totalLidos(diasMarcados) / TOTAL_DIAS) * 100);
}

export function progressoDe(dia: Dia, diasMarcados: number[], hoje: number) {
  const lidos = new Set(diasMarcados);
  return {
    dia: dia.dia,
    lido: lidos.has(dia.dia),
    disponivel: dia.dia <= hoje,
  };
}