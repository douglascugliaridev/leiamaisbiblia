"use client";

import Link from "next/link";
import type { EstadoFormulario } from "@/lib/acoes-auth";
import {
  BotaoEnviar,
  Campo,
  MensagemGeral,
  useFormularioAcesso,
} from "@/components/campos";
import { Logo } from "@/components/logo";
import { SeletorTema } from "@/components/seletor-tema";

export function TelaAcesso({
  modo,
  acao,
}: {
  modo: "login" | "cadastro";
  acao: (
    estado: EstadoFormulario,
    dados: FormData,
  ) => Promise<EstadoFormulario>;
}) {
  const { dispatch, estado, erroDe, nome, email, setNome, setEmail } =
    useFormularioAcesso(acao);

  const ehLogin = modo === "login";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo variante="horizontal" tamanho={185} prioridade />
          <p className="mt-3 text-sm text-suave">
            67 dias para conhecer a Bíblia inteira
          </p>
        </div>

        <form
          action={dispatch}
          className="flex flex-col gap-4 rounded-2xl border border-linha bg-cartao p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold">
            {ehLogin ? "Entrar na sua conta" : "Criar conta"}
          </h2>

          {estado && <MensagemGeral estado={estado} />}

          {!ehLogin && (
            <Campo
              name="nome"
              label="Nome"
              autoComplete="name"
              minLength={2}
              value={nome}
              onChange={setNome}
              erro={erroDe("nome")}
            />
          )}

          <Campo
            name="email"
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={setEmail}
            erro={erroDe("email")}
          />

          <Campo
            name="senha"
            label="Senha"
            type="password"
            autoComplete={ehLogin ? "current-password" : "new-password"}
            minLength={ehLogin ? undefined : 6}
            erro={erroDe("senha")}
          />

          <BotaoEnviar rotulo={ehLogin ? "Entrar" : "Criar conta"} />
        </form>

        <div className="mt-6 flex justify-center">
          <SeletorTema />
        </div>

        <p className="mt-5 text-center text-sm text-suave">
          {ehLogin ? (
            <>
              Ainda não tem conta?{" "}
              <Link
                href="/cadastro"
                className="font-medium text-marca underline"
              >
                Cadastre-se
              </Link>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <Link href="/login" className="font-medium text-marca underline">
                Entrar
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}