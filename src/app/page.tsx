import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";

// Lê cookies para saber se há sessão; rota dinâmica por natureza.
export const instant = false;

export default async function Raiz() {
  const usuario = await usuarioAtual();
  redirect(usuario ? "/plano" : "/login");
}