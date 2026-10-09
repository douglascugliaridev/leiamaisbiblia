"use server";

import { redirect } from "next/navigation";
import {
  buscarPorEmail,
  conferirSenha,
  criarSessao,
  criarUsuario,
  emailEmUso,
  encerrarSessao,
  hashSenha,
} from "./auth";

export type ErroFormulario = {
  campo: "nome" | "email" | "senha" | "formulario";
  mensagem: string;
};

export type EstadoFormulario = { erro: ErroFormulario } | null;

function validar(
  nome: string,
  email: string,
  senha: string,
): ErroFormulario | null {
  if (nome.trim().length < 2) {
    return { campo: "nome", mensagem: "Informe seu nome." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { campo: "email", mensagem: "E-mail inválido." };
  }
  if (senha.length < 6) {
    return {
      campo: "senha",
      mensagem: "A senha precisa ter pelo menos 6 caracteres.",
    };
  }
  return null;
}

export async function cadastrar(
  _estado: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const nome = String(dados.get("nome") ?? "");
  const email = String(dados.get("email") ?? "");
  const senha = String(dados.get("senha") ?? "");

  const erro = validar(nome, email, senha);
  if (erro) return { erro };

  if (emailEmUso(email)) {
    return {
      erro: { campo: "email", mensagem: "Já existe uma conta com este e-mail." },
    };
  }

  const usuario = criarUsuario(nome, email, hashSenha(senha));
  await criarSessao(usuario.id);
  redirect("/plano");
}

export async function entrar(
  _estado: EstadoFormulario,
  dados: FormData,
): Promise<EstadoFormulario> {
  const email = String(dados.get("email") ?? "");
  const senha = String(dados.get("senha") ?? "");

  if (!email.trim() || !senha) {
    return {
      erro: { campo: "formulario", mensagem: "Informe e-mail e senha." },
    };
  }

  try {
    const usuario = buscarPorEmail(email);
    if (!conferirSenha(senha, usuario.senha_hash)) {
      return {
        erro: { campo: "formulario", mensagem: "E-mail ou senha incorretos." },
      };
    }
    await criarSessao(usuario.id);
  } catch {
    return {
      erro: { campo: "formulario", mensagem: "E-mail ou senha incorretos." },
    };
  }

  redirect("/plano");
}

export async function sair(): Promise<void> {
  await encerrarSessao();
  redirect("/login");
}