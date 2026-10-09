/**
 * Gera um backup consistente do banco em um único arquivo.
 *
 * Seguro para rodar com o servidor no ar: usa VACUUM INTO, que faz backup
 * pela API do SQLite e já inclui o conteúdo do WAL. Copiar `leia-mais.db` na
 * mão não serve — os dados recentes só estão no arquivo `-wal`.
 *
 *   node scripts/backup.mjs                    # backups/leia-mais-<data>.db
 *   node scripts/backup.mjs /caminho/arquivo.db
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { getDb, caminhoBanco, gerarBackup } from "../src/lib/db.ts";

const destino =
  process.argv[2] ??
  path.join(
    process.cwd(),
    "backups",
    `leia-mais-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.db`,
  );

mkdirSync(path.dirname(destino), { recursive: true });

const antes = getDb()
  .prepare("SELECT COUNT(*) AS c FROM users")
  .get().c;

gerarBackup(destino);

const depois = getDb()
  .prepare("SELECT COUNT(*) AS c FROM users")
  .get().c;

if (antes !== depois) {
  console.error("ERRO: contagem de usuários mudou durante o backup. Abortando.");
  process.exit(1);
}

console.log(`backup criado: ${destino}`);
console.log(`usuários no original: ${antes}`);
console.log(`origem: ${caminhoBanco()}`);