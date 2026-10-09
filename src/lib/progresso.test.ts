import { test } from "node:test";
import assert from "node:assert/strict";
import {
  diaDisponivel,
  diasEntre,
  melhorStreak,
  podeMarcar,
  progresso,
  streakAtual,
  totalLidos,
} from "./progresso";

test("diasEntre conta dias corridos no fuso local", () => {
  assert.equal(diasEntre("2026-01-01", "2026-01-01"), 0);
  assert.equal(diasEntre("2026-01-01", "2026-01-02"), 1);
  assert.equal(diasEntre("2026-01-31", "2026-02-01"), 1);
  assert.equal(diasEntre("2024-02-28", "2024-03-01"), 2); // ano bissexto
  assert.equal(diasEntre("2026-01-10", "2026-01-01"), -9);
});

test("diaDisponivel conta o dia do cadastro como dia 1", () => {
  assert.equal(diaDisponivel("2026-01-01", "2026-01-01"), 1);
  assert.equal(diaDisponivel("2026-01-01", "2026-01-02"), 2);
  assert.equal(diaDisponivel("2026-01-01", "2026-01-08"), 8);
});

test("diaDisponivel nunca passa de 67 mesmo com plano antigo", () => {
  assert.equal(diaDisponivel("2020-01-01", "2026-01-01"), 67);
});

test("podeMarcar libera o dia de hoje e bloqueia os futuros", () => {
  const inicio = "2026-01-01";
  const hoje = "2026-01-03"; // dia 3 disponível
  assert.equal(podeMarcar(1, inicio, hoje), true);
  assert.equal(podeMarcar(3, inicio, hoje), true);
  assert.equal(podeMarcar(4, inicio, hoje), false);
});

test("podeMarcar rejeita dias fora da faixa 1..67", () => {
  const inicio = "2020-01-01";
  assert.equal(podeMarcar(0, inicio, "2026-01-01"), false);
  assert.equal(podeMarcar(68, inicio, "2026-01-01"), false);
  assert.equal(podeMarcar(1.5, inicio, "2026-01-01"), false);
});

test("streakAtual conta sequência corrida terminando hoje", () => {
  assert.equal(streakAtual([1, 2, 3], 3), 3);
  assert.equal(streakAtual([1, 2, 3, 5], 5), 1); // dia 4 faltando quebra
});

test("streakAtual tolera ainda não ter lido hoje", () => {
  // leu até ontem: streak continua vivo
  assert.equal(streakAtual([1, 2, 3], 4), 3);
  // não leu hoje nem ontem: streak zerado
  assert.equal(streakAtual([1, 2], 4), 0);
  assert.equal(streakAtual([], 4), 0);
});

test("streakAtual não exige progresso desde o dia 1", () => {
  // pulou os primeiros dias, streak vale a partir de onde começou
  assert.equal(streakAtual([5, 6, 7], 7), 3);
});

test("melhorStreak acha a maior sequência do histórico", () => {
  assert.equal(melhorStreak([1, 2, 3, 5, 6]), 3);
  assert.equal(melhorStreak([]), 0);
  assert.equal(melhorStreak([7]), 1);
  assert.equal(melhorStreak([1, 3, 5, 7, 9]), 1);
});

test("melhorStreak ignora dias duplicados", () => {
  assert.equal(melhorStreak([1, 1, 2, 3]), 3);
});

test("totalLidos e progresso contam dias distintos", () => {
  assert.equal(totalLidos([1, 1, 2]), 2);
  assert.equal(progresso([]), 0);
  assert.equal(progresso([1, 2, 3]), 4); // 3/67 = 4,48% arredondado
  assert.equal(totalLidos(Array.from({ length: 67 }, (_, i) => i + 1)), 67);
});