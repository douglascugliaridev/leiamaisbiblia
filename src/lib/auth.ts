import "server-only";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";

const COOKIE = "sessao";
const MAX_AGE_SEGUNDOS = 60 * 60 * 24 * 30;

function segredo(): Uint8Array {
  const valor = process.env.SESSION_SECRET;
  if (!valor) {
    throw new Error(
      "SESSION_SECRET não definido. Gere um com: openssl rand -base64 32",
    );
  }
  return new TextEncoder().encode(valor);
}

export type Usuario = {
  id: number;
  email: string;
  nome: string;
  inicio_em: string;
};

export function hojeISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

export async function criarSessao(userId: number): Promise<void> {
  // jti único por sessão: o JWT é autocontido e sobreviveria à limpeza do
  // cookie, então registramos a sessão no banco para poder revogá-la no logout.
  const jti = crypto.randomUUID();
  const expiraEm = Math.floor(Date.now() / 1000) + MAX_AGE_SEGUNDOS;

  getDb()
    .prepare("INSERT INTO sessoes (jti, user_id, expira_em) VALUES (?, ?, ?)")
    .run(jti, userId, expiraEm);

  const token = await new SignJWT({ sub: String(userId), jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEGUNDOS}s`)
    .sign(segredo());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEGUNDOS,
  });
}

export async function encerrarSessao(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, segredo());
      if (typeof payload.jti === "string") {
        getDb().prepare("DELETE FROM sessoes WHERE jti = ?").run(payload.jti);
      }
    } catch {
      // token já inválido: apagar o cookie basta
    }
  }

  store.delete(COOKIE);
}

/** Usuário da requisição atual, ou null se não houver sessão válida. */
export async function usuarioAtual(): Promise<Usuario | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, segredo());
    const id = Number(payload.sub);
    if (!Number.isInteger(id)) return null;
    if (typeof payload.jti !== "string") return null;

    // a sessão precisa existir e não estar expirada: é o que torna o logout real
    const sessao = getDb()
      .prepare("SELECT expira_em FROM sessoes WHERE jti = ? AND user_id = ?")
      .get(payload.jti, id) as { expira_em: number } | undefined;

    if (!sessao) return null;
    if (sessao.expira_em * 1000 < Date.now()) {
      getDb().prepare("DELETE FROM sessoes WHERE jti = ?").run(payload.jti);
      return null;
    }

    const linha = getDb()
      .prepare(
        "SELECT id, email, nome, inicio_em FROM users WHERE id = ?",
      )
      .get(id);

    return (linha as Usuario | undefined) ?? null;
  } catch {
    return null;
  }
}

/** Igual a usuarioAtual, mas falha alto: use só em rotas já protegidas. */
export async function usuarioObrigatorio(): Promise<Usuario> {
  const usuario = await usuarioAtual();
  if (!usuario) {
    throw new Error("Sessão inválida ou expirada");
  }
  return usuario;
}

export function hashSenha(senha: string): string {
  return bcrypt.hashSync(senha, 12);
}

export function conferirSenha(senha: string, hash: string): boolean {
  return bcrypt.compareSync(senha, hash);
}

export function buscarPorEmail(email: string): Usuario & { senha_hash: string } {
  const linha = getDb()
    .prepare(
      "SELECT id, email, nome, inicio_em, senha_hash FROM users WHERE email = ?",
    )
    .get(email.trim());

  if (!linha) {
    throw new Error("E-mail ou senha incorretos");
  }
  return linha as Usuario & { senha_hash: string };
}

export function emailEmUso(email: string): boolean {
  const linha = getDb()
    .prepare("SELECT 1 AS encontrado FROM users WHERE email = ?")
    .get(email.trim());
  return linha !== undefined;
}

export function criarUsuario(
  nome: string,
  email: string,
  senhaHash: string,
): Usuario {
  const agora = new Date().toISOString();
  const info = getDb()
    .prepare(
      `INSERT INTO users (email, nome, senha_hash, inicio_em, criado_em)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(email.trim(), nome.trim(), senhaHash, hojeISO(), agora);

  const novo = getDb()
    .prepare("SELECT id, email, nome, inicio_em FROM users WHERE id = ?")
    .get(Number(info.lastInsertRowid));

  return novo as Usuario;
}