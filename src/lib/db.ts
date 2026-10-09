import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_PATH ?? path.join(DB_DIR, "leia-mais.db");

declare global {
  var __leiaMaisDb: DatabaseSync | undefined;
}

function criarBanco(): DatabaseSync {
  mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const db = new DatabaseSync(DB_PATH);
  // WAL permite leituras concorrentes sem travar escritas.
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  // NORMAL (padrão do WAL) pode perder as últimas confirmações numa queda de
  // energia. FULL custa uma sincronização a cada escrita — irrelevante neste
  // volume de uso e elimina essa janela de perda.
  db.exec("PRAGMA synchronous = FULL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT NOT NULL UNIQUE COLLATE NOCASE,
      nome       TEXT NOT NULL,
      senha_hash TEXT NOT NULL,
      inicio_em  TEXT NOT NULL,
      criado_em  TEXT NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS leituras (
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      dia      INTEGER NOT NULL CHECK (dia BETWEEN 1 AND 67),
      lido_em  TEXT NOT NULL,
      PRIMARY KEY (user_id, dia)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessoes (
      jti      TEXT PRIMARY KEY,
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expira_em INTEGER NOT NULL
    )
  `);

  db.exec("CREATE INDEX IF NOT EXISTS idx_leituras_user ON leituras(user_id)");
  db.exec("CREATE INDEX IF NOT EXISTS idx_sessoes_user ON sessoes(user_id)");

  return db;
}

export function getDb(): DatabaseSync {
  if (!globalThis.__leiaMaisDb) {
    globalThis.__leiaMaisDb = criarBanco();
  }
  return globalThis.__leiaMaisDb;
}

export function caminhoBanco(): string {
  return DB_PATH;
}

/**
 * Descarrega o WAL para o arquivo principal e fecha a conexão. Sem isso, os
 * dados mais recentes ficam espalhados em `leia-mais.db-wal`, e copiar só o
 * `.db` perde as últimas escritas.
 */
export function fecharDb(): void {
  const db = globalThis.__leiaMaisDb;
  if (!db) return;
  // TRUNCATE: executa o checkpoint e ainda reduz o -wal a zero bytes
  db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  db.close();
  globalThis.__leiaMaisDb = undefined;
}

/**
 * Backup consistente para um único arquivo, seguro para rodar com o servidor
 * no ar. O VACUUM INTO usa a API de backup do SQLite: o resultado já inclui
 * o conteúdo do WAL.
 */
export function gerarBackup(destino: string): void {
  getDb().exec(`VACUUM INTO '${destino.replace(/'/g, "''")}'`);
}