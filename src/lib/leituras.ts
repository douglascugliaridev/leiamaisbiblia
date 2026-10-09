import "server-only";
import { getDb } from "./db";

export function diasMarcados(userId: number): number[] {
  const linhas = getDb()
    .prepare("SELECT dia FROM leituras WHERE user_id = ? ORDER BY dia")
    .all(userId) as Array<{ dia: number }>;
  return linhas.map((l) => l.dia);
}

export function alternarLeitura(userId: number, dia: number): boolean {
  const db = getDb();
  const agora = new Date().toISOString();

  const existente = db
    .prepare("SELECT 1 AS encontrado FROM leituras WHERE user_id = ? AND dia = ?")
    .get(userId, dia);

  if (existente) {
    db.prepare("DELETE FROM leituras WHERE user_id = ? AND dia = ?").run(userId, dia);
    return false;
  }

  db.prepare(
    "INSERT INTO leituras (user_id, dia, lido_em) VALUES (?, ?, ?)",
  ).run(userId, dia, agora);
  return true;
}

/** Zera o progresso e recomeça o plano a partir de hoje. */
export function reiniciarPlano(userId: number, novoInicio: string): void {
  const db = getDb();
  db.exec("BEGIN");
  try {
    db.prepare("DELETE FROM leituras WHERE user_id = ?").run(userId);
    db.prepare("UPDATE users SET inicio_em = ? WHERE id = ?").run(
      novoInicio,
      userId,
    );
    db.exec("COMMIT");
  } catch (erro) {
    db.exec("ROLLBACK");
    throw erro;
  }
}