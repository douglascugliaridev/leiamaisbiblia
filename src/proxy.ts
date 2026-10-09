import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { getDb } from "@/lib/db";

const COOKIE = "sessao";
const PROTEGIDAS = ["/plano"];

function segredo(): Uint8Array {
  return new TextEncoder().encode(process.env.SESSION_SECRET ?? "");
}

/**
 * Proxy roda no runtime Node (padrão no Next 16), então pode consultar o
 * SQLite e ser a autoridade da sessão: um token revogado no logout é barrado
 * aqui, e não só nas páginas.
 */
async function tokenValido(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, segredo());
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || typeof payload.jti !== "string") {
      return false;
    }

    const sessao = getDb()
      .prepare("SELECT expira_em FROM sessoes WHERE jti = ? AND user_id = ?")
      .get(payload.jti, userId) as { expira_em: number } | undefined;

    return sessao !== undefined && sessao.expira_em * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const ehProtegida = PROTEGIDAS.some((p) => pathname.startsWith(p));
  const ehAcesso = pathname === "/login" || pathname === "/cadastro";

  const token = request.cookies.get(COOKIE)?.value;
  const logado = token ? await tokenValido(token) : false;

  if (ehProtegida && !logado) {
    const url = new URL("/login", request.url);
    url.searchParams.set("proximo", pathname);
    return NextResponse.redirect(url);
  }

  if (logado && ehAcesso) {
    return NextResponse.redirect(new URL("/plano", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/plano/:path*", "/login", "/cadastro"],
};