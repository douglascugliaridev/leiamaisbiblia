import { fecharDb, getDb } from "@/lib/db";

/**
 * Abre o banco na subida e garante que, ao receber um sinal de parada, o WAL
 * seja gravado no arquivo principal antes do processo morrer.
 *
 * Sem isso os dados mais recentes ficam só em `leia-mais.db-wal`, e copiar só
 * o `.db` perde as últimas escritas.
 */
export function instalarShutdownSeguro(): void {
  getDb();

  let jaEncerrou = false;

  function encerrar(sinal: string): void {
    if (jaEncerrou) return;
    jaEncerrou = true;
    console.log(`[leia-mais] ${sinal} recebido, gravando o banco…`);
    try {
      fecharDb();
      console.log("[leia-mais] banco gravado com segurança.");
    } catch (erro) {
      console.error("[leia-mais] falha ao gravar o banco:", erro);
    }
  }

  process.on("SIGINT", () => encerrar("SIGINT"));
  process.on("SIGTERM", () => encerrar("SIGTERM"));
  process.on("exit", () => encerrar("exit"));

  console.log(
    `[leia-mais] banco aberto (WAL com synchronous=FULL). Envie SIGINT ou use Ctrl+C para encerrar com segurança.`,
  );
}