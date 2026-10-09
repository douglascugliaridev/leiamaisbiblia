import { cadastrar } from "@/lib/acoes-auth";
import { TelaAcesso } from "@/components/tela-acesso";

export default function CadastroPage() {
  return <TelaAcesso modo="cadastro" acao={cadastrar} />;
}