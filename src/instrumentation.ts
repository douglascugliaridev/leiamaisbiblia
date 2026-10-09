/**
 * O Next compila a instrumentação para Edge e para Node. Só o runtime Node
 * pode tocar em `node:sqlite` e `process.cwd()`, então o código do banco fica
 * num módulo aparte, carregado apenas quando NEXT_RUNTIME === "nodejs".
 */
export function register(): void {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    import("./instrumentation-node").then((m) => m.instalarShutdownSeguro());
  }
}