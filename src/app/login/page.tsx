import { entrar } from "@/lib/acoes-auth";
import { TelaAcesso } from "@/components/tela-acesso";

export default function LoginPage() {
  return <TelaAcesso modo="login" acao={entrar} />;
}